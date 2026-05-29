"use server";

import { Prisma } from "@eco-bright/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@eco-bright/db";
import { productSchema } from "@eco-bright/validators/product";
import { requireAuth } from "@/lib/session";

function getErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Product ID already exists.";
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

function toNullableNumber(value: "" | number | undefined) {
  return value === "" || value === undefined ? null : value;
}

export async function createProductAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice"),
    currency: formData.get("currency"),
    imageUrl: formData.get("imageUrl"),
    imageUrls: formData.get("imageUrls"),
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
    categoryId: formData.get("categoryId")
  });

  if (!parsed.success) {
    redirect(
      `/products/new?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid data."
      )}`
    );
  }

  const categoryValues = await getCategoryValues(parsed.data.categoryId);

  if (!categoryValues) {
    redirect("/products/new?error=Selected%20category%20was%20not%20found.");
  }

  try {
    await db.product.create({
      data: {
        id: parsed.data.id,
        title: parsed.data.title,
        category: categoryValues.category,
        categoryLabel: categoryValues.categoryLabel,
        useCase: parsed.data.useCase || null,
        description: parsed.data.description,
        price: parsed.data.price,
        oldPrice: toNullableNumber(parsed.data.oldPrice),
        currency: parsed.data.currency,
        imageUrl: parsed.data.imageUrl || null,
        imageUrls: parseList(parsed.data.imageUrls),
        badge: parsed.data.badge || null,
        tags: parseList(parsed.data.tags),
        inStock: parsed.data.inStock === "true",
        isActive: parsed.data.isActive === "true",
        packQty: toNullableNumber(parsed.data.packQty),
        holeSize: parsed.data.holeSize || null,
        sortOrder: toNullableNumber(parsed.data.sortOrder),
        needsReview: parsed.data.needsReview === "true",
        reviewFlags: parseList(parsed.data.reviewFlags),
        rawCategory: parsed.data.rawCategory || null,
        titleKm: parsed.data.titleKm || null,
        categoryLabelKm: parsed.data.categoryLabelKm || null,
        useCaseKm: parsed.data.useCaseKm || null,
        descriptionKm: parsed.data.descriptionKm || null,
        createdById: user.id
      }
    });
  } catch (error) {
    redirect(`/products/new?error=${encodeURIComponent(getErrorMessage(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAuth();
  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice"),
    currency: formData.get("currency"),
    imageUrl: formData.get("imageUrl"),
    imageUrls: formData.get("imageUrls"),
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
    categoryId: formData.get("categoryId")
  });

  if (!parsed.success) {
    redirect(
      `/products/${id}/edit?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid data."
      )}`
    );
  }

  const categoryValues = await getCategoryValues(parsed.data.categoryId);

  if (!categoryValues) {
    redirect(`/products/${id}/edit?error=Selected%20category%20was%20not%20found.`);
  }

  try {
    await db.product.update({
      where: { id },
      data: {
        title: parsed.data.title,
        category: categoryValues.category,
        categoryLabel: categoryValues.categoryLabel,
        useCase: parsed.data.useCase || null,
        description: parsed.data.description,
        price: parsed.data.price,
        oldPrice: toNullableNumber(parsed.data.oldPrice),
        currency: parsed.data.currency,
        imageUrl: parsed.data.imageUrl || null,
        imageUrls: parseList(parsed.data.imageUrls),
        badge: parsed.data.badge || null,
        tags: parseList(parsed.data.tags),
        inStock: parsed.data.inStock === "true",
        isActive: parsed.data.isActive === "true",
        packQty: toNullableNumber(parsed.data.packQty),
        holeSize: parsed.data.holeSize || null,
        sortOrder: toNullableNumber(parsed.data.sortOrder),
        needsReview: parsed.data.needsReview === "true",
        reviewFlags: parseList(parsed.data.reviewFlags),
        rawCategory: parsed.data.rawCategory || null,
        titleKm: parsed.data.titleKm || null,
        categoryLabelKm: parsed.data.categoryLabelKm || null,
        useCaseKm: parsed.data.useCaseKm || null,
        descriptionKm: parsed.data.descriptionKm || null
      }
    });
  } catch (error) {
    redirect(`/products/${id}/edit?error=${encodeURIComponent(getErrorMessage(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
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
