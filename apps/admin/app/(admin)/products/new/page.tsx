import Link from "next/link";
import { db } from "@eco-bright/db";
import { createProductAction } from "@/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/page-shell";

export default async function NewProductPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  return (
    <>
      <PageHeader
        title="New Product"
        description="Create a catalog row with R2-hosted images, price fields, and stock quantity."
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "New Product" }
        ]}
        action={
          <Button asChild variant="outline">
            <Link href="/products">Back to Products</Link>
          </Button>
        }
      />

      <ProductForm
        action={createProductAction}
        categories={categories}
        mode="create"
        error={params.error}
        initialValues={{
          id: params.id ?? "",
          title: params.title ?? "",
          categoryId: params.categoryId ?? "",
          description: params.description ?? "",
          price: params.price ?? "",
          oldPrice: params.oldPrice ?? "",
          currency: params.currency ?? "USD",
          stockQty: params.stockQty ?? "0",
          imageUrl: params.imageUrl ?? "",
          imageUrls: params.imageUrls
            ? params.imageUrls.split(",").map((value) => value.trim()).filter(Boolean)
            : [],
          isActive: params.isActive ?? "true",
          inStock: params.inStock ?? "true",
          badge: params.badge ?? "",
          tags: params.tags ?? "",
          useCase: params.useCase ?? "",
          packQty: params.packQty ?? "",
          holeSize: params.holeSize ?? "",
          sortOrder: params.sortOrder ?? "",
          needsReview: params.needsReview ?? "false",
          rawCategory: params.rawCategory ?? "",
          reviewFlags: params.reviewFlags ?? "",
          titleKm: params.titleKm ?? "",
          categoryLabelKm: params.categoryLabelKm ?? "",
          useCaseKm: params.useCaseKm ?? "",
          descriptionKm: params.descriptionKm ?? "",
          attributes: [],
          variants: []
        }}
      />
    </>
  );
}
