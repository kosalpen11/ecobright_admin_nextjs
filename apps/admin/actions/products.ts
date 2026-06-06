"use server";

import { Prisma } from "@eco-bright/db";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@eco-bright/db";
import {
  productAttributeDraftSchema,
  productSchema,
  productVariantDraftSchema
} from "@eco-bright/validators/product";
import { requireAuth } from "@/lib/session";

const attributesPayloadSchema = z.array(productAttributeDraftSchema);
const variantsPayloadSchema = z.array(productVariantDraftSchema);
type ParsedAttributeDraft = z.output<typeof productAttributeDraftSchema>;
type ParsedVariantDraft = z.output<typeof productVariantDraftSchema>;
type AttributeCache = {
  attributeIds: Map<string, string>;
  attributeValueIds: Map<string, string>;
};
type NormalizedAttributeValue = {
  attributeName: string;
  attributeKey: string;
  value: string;
  valueKey: string;
};

function getErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Product ID or variant SKU already exists.";
  }

  return "Unable to save product.";
}

function parseList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNullableNumber(value: "" | number | undefined) {
  return value === "" || value === undefined ? null : value;
}

function parseJsonPayload<T>(value: string | undefined, schema: z.ZodSchema<T>, fallback: T) {
  if (!value) {
    return fallback;
  }

  const parsed = schema.safeParse(JSON.parse(value));

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid nested payload.");
  }

  return parsed.data;
}

function hasVariantModels(client: unknown) {
  const value = client as Record<string, unknown> | null | undefined;

  return Boolean(
    value &&
      typeof value.productVariant === "object" &&
      value.productVariant &&
      typeof (value.productVariant as { findMany?: unknown }).findMany === "function" &&
      typeof value.productAttribute === "object" &&
      value.productAttribute &&
      typeof (value.productAttribute as { findMany?: unknown }).findMany === "function" &&
      typeof value.productAttributeValue === "object" &&
      value.productAttributeValue &&
      typeof (value.productAttributeValue as { findMany?: unknown }).findMany === "function" &&
      typeof value.productVariantAttributeValue === "object" &&
      value.productVariantAttributeValue
  );
}

async function getCategoryValues(categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    return null;
  }

  return {
    category: category.slug,
    categoryLabel: category.name
  };
}

function normalizeAttributeKey(attributeName: string) {
  return attributeName.trim().toLowerCase();
}

function normalizeAttributeValueKey(attributeName: string, value: string) {
  return `${normalizeAttributeKey(attributeName)}::${value.trim().toLowerCase()}`;
}

function collectNormalizedAttributeValues(
  attributes: ParsedAttributeDraft[],
  variants: ParsedVariantDraft[]
) {
  const normalized = new Map<string, NormalizedAttributeValue>();

  for (const attribute of attributes) {
    for (const value of attribute.values) {
      const valueKey = normalizeAttributeValueKey(attribute.name, value);
      normalized.set(valueKey, {
        attributeName: attribute.name.trim(),
        attributeKey: normalizeAttributeKey(attribute.name),
        value: value.trim(),
        valueKey
      });
    }
  }

  for (const variant of variants) {
    for (const selection of variant.attributeSelections) {
      const valueKey = normalizeAttributeValueKey(selection.attributeName, selection.value);
      normalized.set(valueKey, {
        attributeName: selection.attributeName.trim(),
        attributeKey: normalizeAttributeKey(selection.attributeName),
        value: selection.value.trim(),
        valueKey
      });
    }
  }

  return Array.from(normalized.values());
}

async function prepareAttributeCache(
  tx: Prisma.TransactionClient,
  cache: AttributeCache,
  attributes: ParsedAttributeDraft[],
  variants: ParsedVariantDraft[]
) {
  if (!hasVariantModels(tx)) {
    return;
  }

  const normalizedValues = collectNormalizedAttributeValues(attributes, variants);
  const attributeNames = Array.from(
    new Set(normalizedValues.map((item) => item.attributeName))
  );

  if (attributeNames.length === 0) {
    return;
  }

  await tx.productAttribute.createMany({
    data: attributeNames.map((name) => ({ name })),
    skipDuplicates: true
  });

  const persistedAttributes = await tx.productAttribute.findMany({
    where: {
      name: {
        in: attributeNames
      }
    }
  });
  const attributeNameById = new Map(
    persistedAttributes.map((attribute) => [attribute.id, attribute.name])
  );

  for (const attribute of persistedAttributes) {
    cache.attributeIds.set(normalizeAttributeKey(attribute.name), attribute.id);
  }

  const valueRows = normalizedValues
    .map((item) => {
      const productAttributeId = cache.attributeIds.get(item.attributeKey);

      if (!productAttributeId) {
        return null;
      }

      return {
        productAttributeId,
        value: item.value
      };
    })
    .filter((item): item is { productAttributeId: string; value: string } => Boolean(item));

  if (valueRows.length > 0) {
    await tx.productAttributeValue.createMany({
      data: valueRows,
      skipDuplicates: true
    });
  }

  const persistedValues = await tx.productAttributeValue.findMany({
    where: {
      OR: valueRows.map((row) => ({
        productAttributeId: row.productAttributeId,
        value: row.value
      }))
    }
  });

  for (const attributeValue of persistedValues) {
    const attributeName = attributeNameById.get(attributeValue.productAttributeId);

    if (!attributeName) {
      continue;
    }

    cache.attributeValueIds.set(
      normalizeAttributeValueKey(attributeName, attributeValue.value),
      attributeValue.id
    );
  }
}

async function syncVariantAttributeSelections(
  tx: Prisma.TransactionClient,
  cache: AttributeCache,
  variantId: string,
  selections: ParsedVariantDraft["attributeSelections"]
) {
  if (!hasVariantModels(tx)) {
    return;
  }

  await tx.productVariantAttributeValue.deleteMany({
    where: { productVariantId: variantId }
  });

  const rows: Array<{
    productVariantId: string;
    productAttributeValueId: string;
  }> = [];
  const seen = new Set<string>();

  for (const selection of selections) {
    const attributeValueId = cache.attributeValueIds.get(
      normalizeAttributeValueKey(selection.attributeName, selection.value)
    );

    if (!attributeValueId) {
      continue;
    }

    const rowKey = `${variantId}::${attributeValueId}`;
    if (seen.has(rowKey)) {
      continue;
    }

    seen.add(rowKey);
    rows.push({
      productVariantId: variantId,
      productAttributeValueId: attributeValueId
    });
  }

  if (rows.length > 0) {
    await tx.productVariantAttributeValue.createMany({
      data: rows
    });
  }
}

async function syncProductVariants(
  tx: Prisma.TransactionClient,
  cache: AttributeCache,
  productId: string,
  variants: ParsedVariantDraft[]
) {
  if (!hasVariantModels(tx)) {
    return {
      totalStock: 0,
      hasVariants: false
    };
  }

  const existingVariants = await tx.productVariant.findMany({
    where: { productId },
    select: { id: true }
  });

  const existingIds = new Set(existingVariants.map((variant) => variant.id));
  const submittedExistingIds = new Set(
    variants
      .map((variant) => variant.id?.trim())
      .filter((value): value is string => Boolean(value))
  );

  const removedVariantIds = existingVariants
    .map((variant) => variant.id)
    .filter((id) => !submittedExistingIds.has(id));

  if (removedVariantIds.length > 0) {
    const variantsWithHistory = await tx.stockMovement.findMany({
      where: {
        productVariantId: {
          in: removedVariantIds
        }
      },
      select: {
        productVariantId: true
      },
      distinct: ["productVariantId"]
    });

    const protectedIds = new Set(
      variantsWithHistory
        .map((movement) => movement.productVariantId)
        .filter((value): value is string => Boolean(value))
    );

    const deletableIds = removedVariantIds.filter((id) => !protectedIds.has(id));
    const deactivateOnlyIds = removedVariantIds.filter((id) => protectedIds.has(id));

    if (deletableIds.length > 0) {
      await tx.productVariantAttributeValue.deleteMany({
        where: {
          productVariantId: {
            in: deletableIds
          }
        }
      });

      await tx.productVariant.deleteMany({
        where: {
          id: {
            in: deletableIds
          }
        }
      });
    }

    if (deactivateOnlyIds.length > 0) {
      await tx.productVariant.updateMany({
        where: {
          id: {
            in: deactivateOnlyIds
          }
        },
        data: {
          isActive: false
        }
      });
    }
  }

  for (const variant of variants) {
    const payload = {
      sku: variant.sku?.trim() ? variant.sku.trim() : null,
      title: variant.title?.trim() ? variant.title.trim() : null,
      price: variant.price,
      oldPrice: variant.oldPrice ?? null,
      currency: variant.currency?.trim() || "USD",
      stockQty: variant.stockQty,
      lowStockAlert: variant.lowStockAlert,
      imageUrl: variant.imageUrl?.trim() ? variant.imageUrl.trim() : null,
      sortOrder: variant.sortOrder ?? 0,
      isActive: variant.isActive ?? true
    };

    let variantId = variant.id?.trim() || "";

    if (variantId && existingIds.has(variantId)) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: payload
      });
    } else {
      const createdVariant = await tx.productVariant.create({
        data: {
          id: nanoid(),
          ...payload,
          productId
        }
      });
      variantId = createdVariant.id;
    }

    await syncVariantAttributeSelections(tx, cache, variantId, variant.attributeSelections);
  }

  const aggregate = await tx.productVariant.aggregate({
    where: { productId },
    _sum: {
      stockQty: true
    },
    _count: {
      _all: true
    }
  });

  return {
    totalStock: aggregate._sum.stockQty ?? 0,
    hasVariants: aggregate._count._all > 0
  };
}

async function parseProductSubmission(formData: FormData) {
  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice"),
    currency: formData.get("currency"),
    stockQty: formData.get("stockQty"),
    // accept snake_case from the form (`image_url`, `image_urls`),
    // fall back to legacy camelCase (`imageUrl`, `imageUrls`)
    imageUrl: formData.get("image_url") ?? formData.get("imageUrl"),
    imageUrls: formData.get("image_urls") ?? formData.get("imageUrls"),
    badge: formData.get("badge"),
    tags: formData.get("tags"),
    useCase: formData.get("useCase"),
    inStock: String(formData.get("inStock") ?? "false"),
    isActive: String(formData.get("isActive") ?? "false"),
    packQty: formData.get("packQty"),
    holeSize: formData.get("holeSize"),
    sortOrder: formData.get("sortOrder"),
    needsReview: String(formData.get("needsReview") ?? "false"),
    reviewFlags: formData.get("reviewFlags"),
    rawCategory: formData.get("rawCategory"),
    titleKm: formData.get("titleKm"),
    categoryLabelKm: formData.get("categoryLabelKm"),
    useCaseKm: formData.get("useCaseKm"),
    descriptionKm: formData.get("descriptionKm"),
    categoryId: formData.get("categoryId"),
    attributesPayload: formData.get("attributesPayload"),
    variantsPayload: formData.get("variantsPayload")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }

  const attributes = parseJsonPayload(
    parsed.data.attributesPayload || "",
    attributesPayloadSchema,
    []
  ) as ParsedAttributeDraft[];
  const variants = parseJsonPayload(
    parsed.data.variantsPayload || "",
    variantsPayloadSchema,
    []
  ) as ParsedVariantDraft[];

  return {
    product: parsed.data,
    attributes,
    variants
  };
}

export async function createProductAction(formData: FormData) {
  const user = await requireAuth();

  try {
    const submission = await parseProductSubmission(formData);
    const categoryValues = await getCategoryValues(submission.product.categoryId);

    if (!categoryValues) {
      redirect("/products/new?error=Selected%20category%20was%20not%20found.");
    }

    await db.$transaction(async (tx) => {
      const attributeCache: AttributeCache = {
        attributeIds: new Map(),
        attributeValueIds: new Map()
      };
      const supportsVariants = hasVariantModels(tx);

      if (supportsVariants) {
        await prepareAttributeCache(tx, attributeCache, submission.attributes, submission.variants);
      }

      await tx.product.create({
        data: {
          id: submission.product.id,
          title: submission.product.title,
          category: categoryValues.category,
          categoryLabel: categoryValues.categoryLabel,
          useCase: submission.product.useCase || null,
          description: submission.product.description,
          price: submission.product.price,
          oldPrice: toNullableNumber(submission.product.oldPrice),
          currency: submission.product.currency,
          imageUrl: submission.product.imageUrl || null,
          imageUrls: parseList(submission.product.imageUrls),
          badge: submission.product.badge || null,
          tags: parseList(submission.product.tags),
          inStock: submission.product.inStock === "true",
          isActive: submission.product.isActive === "true",
          packQty: toNullableNumber(submission.product.packQty),
          holeSize: submission.product.holeSize || null,
          sortOrder: toNullableNumber(submission.product.sortOrder),
          needsReview: submission.product.needsReview === "true",
          reviewFlags: parseList(submission.product.reviewFlags),
          rawCategory: submission.product.rawCategory || null,
          titleKm: submission.product.titleKm || null,
          categoryLabelKm: submission.product.categoryLabelKm || null,
          useCaseKm: submission.product.useCaseKm || null,
          descriptionKm: submission.product.descriptionKm || null,
          stockQty: submission.product.stockQty,
          createdById: user.id
        }
      });

      if (supportsVariants && submission.variants.length > 0) {
        const variantSummary = await syncProductVariants(
          tx,
          attributeCache,
          submission.product.id,
          submission.variants
        );

        await tx.product.update({
          where: { id: submission.product.id },
          data: {
            stockQty: variantSummary.totalStock,
            inStock: variantSummary.totalStock > 0
          }
        });
      }
    }, {
      timeout: 20000,
      maxWait: 5000
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : getErrorMessage(error);
    redirect(`/products/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/products");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAuth();

  try {
    const submission = await parseProductSubmission(formData);
    const categoryValues = await getCategoryValues(submission.product.categoryId);

    if (!categoryValues) {
      redirect(`/products/${id}/edit?error=Selected%20category%20was%20not%20found.`);
    }

    await db.$transaction(async (tx) => {
      const attributeCache: AttributeCache = {
        attributeIds: new Map(),
        attributeValueIds: new Map()
      };
      const supportsVariants = hasVariantModels(tx);

      if (supportsVariants) {
        await prepareAttributeCache(tx, attributeCache, submission.attributes, submission.variants);
      }

      await tx.product.update({
        where: { id },
        data: {
          title: submission.product.title,
          category: categoryValues.category,
          categoryLabel: categoryValues.categoryLabel,
          useCase: submission.product.useCase || null,
          description: submission.product.description,
          price: submission.product.price,
          oldPrice: toNullableNumber(submission.product.oldPrice),
          currency: submission.product.currency,
          imageUrl: submission.product.imageUrl || null,
          imageUrls: parseList(submission.product.imageUrls),
          badge: submission.product.badge || null,
          tags: parseList(submission.product.tags),
          inStock: submission.product.inStock === "true",
          isActive: submission.product.isActive === "true",
          packQty: toNullableNumber(submission.product.packQty),
          holeSize: submission.product.holeSize || null,
          sortOrder: toNullableNumber(submission.product.sortOrder),
          needsReview: submission.product.needsReview === "true",
          reviewFlags: parseList(submission.product.reviewFlags),
          rawCategory: submission.product.rawCategory || null,
          titleKm: submission.product.titleKm || null,
          categoryLabelKm: submission.product.categoryLabelKm || null,
          useCaseKm: submission.product.useCaseKm || null,
          descriptionKm: submission.product.descriptionKm || null,
          stockQty: submission.product.stockQty
        }
      });

      if (supportsVariants) {
        const variantSummary = await syncProductVariants(
          tx,
          attributeCache,
          id,
          submission.variants
        );

        await tx.product.update({
          where: { id },
          data: variantSummary.hasVariants
            ? {
                stockQty: variantSummary.totalStock,
                inStock: variantSummary.totalStock > 0
              }
            : {
                stockQty: submission.product.stockQty,
                inStock: submission.product.inStock === "true"
              }
        });
      }
    }, {
      timeout: 20000,
      maxWait: 5000
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : getErrorMessage(error);
    redirect(`/products/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/products");
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  if (!id) {
    redirect("/products?error=Missing%20product%20id");
  }

  await db.product.update({
    where: { id },
    data: {
      isActive: nextValue
    }
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function deleteProductAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/products?error=Missing%20product%20id");
  }

  try {
    await db.product.delete({
      where: { id }
    });
  } catch {
    redirect(
      "/products?error=Product%20cannot%20be%20deleted%20while%20stock%20history%20exists"
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/products");
}
