import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@eco-bright/db";
import { updateProductAction } from "@/actions/products";
import { AdminShell } from "@/components/admin-shell";
import { PageHeader, QueryError, SectionCard } from "@/components/page-shell";
import { ProductImagePreviewPanel } from "@/components/product-images";
import { Button, Input, Select, Textarea } from "@/components/ui";
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
      where: { id }
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

  const action = updateProductAction.bind(null, id);
  const selectedCategoryId =
    categories.find((category) => category.slug === product.category)?.id ?? "";

  return (
    <AdminShell currentPath="/products">
      <PageHeader
        title="Edit Product"
        description="Update catalog copy, images, and status without touching stock movement history."
        action={
          <Button asChild variant="outline">
            <Link href="/products">Back to Products</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Product Details" description="List pages are server-rendered from this product record.">
          <form action={action} className="space-y-5">
            <QueryError error={error} />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="id" className="text-sm font-medium text-slate-700">
                  Product ID
                </label>
                <Input id="id" name="id" defaultValue={product.id} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <Input id="title" name="title" defaultValue={product.title} required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium text-slate-700">
                Category
              </label>
              <Select id="categoryId" name="categoryId" defaultValue={selectedCategoryId} required>
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </label>
              <Textarea id="description" name="description" defaultValue={product.description} rows={5} required />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-slate-700">
                  Price
                </label>
                <Input id="price" name="price" type="number" min="0.01" step="0.01" defaultValue={product.price.toString()} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="oldPrice" className="text-sm font-medium text-slate-700">
                  Old Price
                </label>
                <Input id="oldPrice" name="oldPrice" type="number" min="0.01" step="0.01" defaultValue={product.oldPrice?.toString() ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium text-slate-700">
                  Currency
                </label>
                <Input id="currency" name="currency" defaultValue={product.currency} required />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="text-sm font-medium text-slate-700">
                  Main Image URL
                </label>
                <Input id="imageUrl" name="imageUrl" defaultValue={product.imageUrl ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageUrls" className="text-sm font-medium text-slate-700">
                  Detail Images
                </label>
                <Input
                  id="imageUrls"
                  name="imageUrls"
                  defaultValue={product.imageUrls.join(", ")}
                  placeholder="Comma-separated image URLs"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="badge" className="text-sm font-medium text-slate-700">
                  Badge
                </label>
                <Input id="badge" name="badge" defaultValue={product.badge ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium text-slate-700">
                  Tags
                </label>
                <Input id="tags" name="tags" defaultValue={product.tags.join(", ")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="useCase" className="text-sm font-medium text-slate-700">
                  Use Case
                </label>
                <Input id="useCase" name="useCase" defaultValue={product.useCase ?? ""} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="packQty" className="text-sm font-medium text-slate-700">
                  Pack Qty
                </label>
                <Input id="packQty" name="packQty" type="number" min="1" step="1" defaultValue={product.packQty ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="holeSize" className="text-sm font-medium text-slate-700">
                  Hole Size
                </label>
                <Input id="holeSize" name="holeSize" defaultValue={product.holeSize ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="sortOrder" className="text-sm font-medium text-slate-700">
                  Sort Order
                </label>
                <Input id="sortOrder" name="sortOrder" type="number" step="1" defaultValue={product.sortOrder ?? ""} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="inStock" className="text-sm font-medium text-slate-700">
                  In Stock
                </label>
                <Select id="inStock" name="inStock" defaultValue={String(product.inStock)}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Active
                </label>
                <Select id="isActive" name="isActive" defaultValue={String(product.isActive)}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="needsReview" className="text-sm font-medium text-slate-700">
                  Needs Review
                </label>
                <Select id="needsReview" name="needsReview" defaultValue={String(product.needsReview)}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="rawCategory" className="text-sm font-medium text-slate-700">
                  Raw Category
                </label>
                <Input id="rawCategory" name="rawCategory" defaultValue={product.rawCategory ?? ""} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="reviewFlags" className="text-sm font-medium text-slate-700">
                  Review Flags
                </label>
                <Input id="reviewFlags" name="reviewFlags" defaultValue={product.reviewFlags.join(", ")} />
              </div>
              <div className="space-y-2">
                <label htmlFor="titleKm" className="text-sm font-medium text-slate-700">
                  Khmer Title
                </label>
                <Input id="titleKm" name="titleKm" defaultValue={product.titleKm ?? ""} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="categoryLabelKm" className="text-sm font-medium text-slate-700">
                  Khmer Category Label
                </label>
                <Input id="categoryLabelKm" name="categoryLabelKm" defaultValue={product.categoryLabelKm ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="useCaseKm" className="text-sm font-medium text-slate-700">
                  Khmer Use Case
                </label>
                <Input id="useCaseKm" name="useCaseKm" defaultValue={product.useCaseKm ?? ""} />
              </div>
              <div className="space-y-2">
                <label htmlFor="descriptionKm" className="text-sm font-medium text-slate-700">
                  Khmer Description
                </label>
                <Textarea id="descriptionKm" name="descriptionKm" defaultValue={product.descriptionKm ?? ""} rows={4} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Save Changes</Button>
              <Button asChild variant="outline">
                <Link href="/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </SectionCard>

        <ProductImagePreviewPanel
          title={product.title}
          imageUrl={product.imageUrl}
          imageUrls={product.imageUrls}
        />
      </div>
    </AdminShell>
  );
}
