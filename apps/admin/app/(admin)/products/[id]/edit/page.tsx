import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@eco-bright/db";
import { updateProductAction } from "@/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui";

function buildAttributeDrafts(
  variants: Array<{
    attributeLinks: Array<{
      productAttributeValue: {
        value: string;
        productAttribute: {
          name: string;
        };
      };
    }>;
  }>
) {
  const attributeMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const link of variant.attributeLinks) {
      const attributeName = link.productAttributeValue.productAttribute.name;
      const value = link.productAttributeValue.value;
      const values = attributeMap.get(attributeName) ?? new Set<string>();
      values.add(value);
      attributeMap.set(attributeName, values);
    }
  }

  return Array.from(attributeMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values)
  }));
}

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [product, categories, variants] = await Promise.all([
    db.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        price: true,
        oldPrice: true,
        currency: true,
        stockQty: true,
        imageUrl: true,
        imageUrls: true,
        isActive: true,
        inStock: true,
        badge: true,
        tags: true,
        useCase: true,
        packQty: true,
        holeSize: true,
        sortOrder: true,
        needsReview: true,
        rawCategory: true,
        reviewFlags: true,
        titleKm: true,
        categoryLabelKm: true,
        useCaseKm: true,
        descriptionKm: true
      }
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true }
    }),
    // Some Prisma clients may not include the ProductVariant model (monorepo schema mismatch).
    // Guard against that by falling back to an empty array when the model is unavailable.
    (db.productVariant
      ? db.productVariant.findMany({
          where: { productId: id },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            sku: true,
            title: true,
            price: true,
            oldPrice: true,
            currency: true,
            stockQty: true,
            lowStockAlert: true,
            imageUrl: true,
            sortOrder: true,
            isActive: true,
            attributeLinks: {
              select: {
                productAttributeValue: {
                  select: {
                    value: true,
                    productAttribute: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        })
      : Promise.resolve([]))
  ]);

  if (!product) {
    notFound();
  }

  const selectedCategoryId =
    categories.find((category) => category.slug === product.category)?.id ?? "";

  // attach variants loaded separately for compatibility with generated client
  const productWithVariants = {
    ...product,
    variants
  };
  const attributeDrafts = buildAttributeDrafts(productWithVariants.variants);

  return (
    <>
      <PageHeader
        title="Edit Product"
        description="Update R2-hosted images, pricing, and storefront-visible product metadata."
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: productWithVariants.title }
        ]}
        action={
          <Button asChild variant="outline">
            <Link href="/products">Back to Products</Link>
          </Button>
        }
      />

      <ProductForm
        action={updateProductAction.bind(null, id)}
        categories={categories}
        mode="edit"
        error={error}
        initialValues={{
          id: productWithVariants.id,
          title: productWithVariants.title,
          categoryId: selectedCategoryId,
          description: productWithVariants.description,
          price: productWithVariants.price.toString(),
          oldPrice: productWithVariants.oldPrice?.toString() ?? "",
          currency: productWithVariants.currency,
          stockQty: String(productWithVariants.stockQty),
          imageUrl: productWithVariants.imageUrl ?? "",
          imageUrls: productWithVariants.imageUrls,
          isActive: String(productWithVariants.isActive),
          inStock: String(productWithVariants.inStock),
          badge: productWithVariants.badge ?? "",
          tags: productWithVariants.tags.join(", "),
          useCase: productWithVariants.useCase ?? "",
          packQty: productWithVariants.packQty?.toString() ?? "",
          holeSize: productWithVariants.holeSize ?? "",
          sortOrder: productWithVariants.sortOrder?.toString() ?? "",
          needsReview: String(productWithVariants.needsReview),
          rawCategory: productWithVariants.rawCategory ?? "",
          reviewFlags: productWithVariants.reviewFlags.join(", "),
          titleKm: productWithVariants.titleKm ?? "",
          categoryLabelKm: productWithVariants.categoryLabelKm ?? "",
          useCaseKm: productWithVariants.useCaseKm ?? "",
          descriptionKm: productWithVariants.descriptionKm ?? "",
          attributes: attributeDrafts,
          variants: productWithVariants.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku ?? "",
            title: variant.title ?? "",
            price: variant.price.toString(),
            oldPrice: variant.oldPrice?.toString() ?? "",
            currency: variant.currency,
            stockQty: String(variant.stockQty),
            lowStockAlert: String(variant.lowStockAlert),
            imageUrl: variant.imageUrl ?? "",
            sortOrder: variant.sortOrder?.toString() ?? "0",
            isActive: variant.isActive,
            attributeSelections: variant.attributeLinks.map((link) => ({
              attributeName: link.productAttributeValue.productAttribute.name,
              value: link.productAttributeValue.value
            }))
          }))
        }}
      />
    </>
  );
}
