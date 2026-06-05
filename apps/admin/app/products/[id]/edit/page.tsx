import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@eco-bright/db";
import { updateProductAction } from "@/actions/products";
import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/products/ProductForm";
import { PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui";
import { requireAuth } from "@/lib/session";

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const { error } = await searchParams;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
          include: {
            attributeLinks: {
              include: {
                productAttributeValue: {
                  include: {
                    productAttribute: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
  ]);

  if (!product) {
    notFound();
  }

  const selectedCategoryId =
    categories.find((category) => category.slug === product.category)?.id ?? "";

  return (
    <AdminShell currentPath="/products">
      <PageHeader
        title="Edit Product"
        description="Update R2-hosted images, pricing, and storefront-visible product metadata."
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.title }
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
          id: product.id,
          title: product.title,
          categoryId: selectedCategoryId,
          description: product.description,
          price: product.price.toString(),
          oldPrice: product.oldPrice?.toString() ?? "",
          currency: product.currency,
          stockQty: String(product.stockQty),
          imageUrl: product.imageUrl ?? "",
          imageUrls: product.imageUrls,
          isActive: String(product.isActive),
          inStock: String(product.inStock),
          badge: product.badge ?? "",
          tags: product.tags.join(", "),
          useCase: product.useCase ?? "",
          packQty: product.packQty?.toString() ?? "",
          holeSize: product.holeSize ?? "",
          sortOrder: product.sortOrder?.toString() ?? "",
          needsReview: String(product.needsReview),
          rawCategory: product.rawCategory ?? "",
          reviewFlags: product.reviewFlags.join(", "),
          titleKm: product.titleKm ?? "",
          categoryLabelKm: product.categoryLabelKm ?? "",
          useCaseKm: product.useCaseKm ?? "",
          descriptionKm: product.descriptionKm ?? "",
          attributes: Array.from(
            new Map(
              product.variants.flatMap((variant) =>
                variant.attributeLinks.map((link) => [
                  link.productAttributeValue.productAttribute.name,
                  link.productAttributeValue.productAttribute.name
                ])
              )
            ).values()
          ).map((attributeName) => ({
            name: attributeName,
            values: Array.from(
              new Set(
                product.variants.flatMap((variant) =>
                  variant.attributeLinks
                    .filter(
                      (link) =>
                        link.productAttributeValue.productAttribute.name === attributeName
                    )
                    .map((link) => link.productAttributeValue.value)
                )
              )
            )
          })),
          variants: product.variants.map((variant) => ({
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
    </AdminShell>
  );
}
