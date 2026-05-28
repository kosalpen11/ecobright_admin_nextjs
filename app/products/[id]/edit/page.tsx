import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ProductImagePreviewPanel } from "@/components/product-images";
import { updateProductAction } from "@/app/products/actions";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id }
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell title="Edit Product" currentPath="/products">
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
      <div className="panel">
        <form action={updateProductAction.bind(null, product.id)} className="form-grid">
          <input type="hidden" name="id" value={product.id} />

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="idDisplay">Product ID</label>
              <input id="idDisplay" value={product.id} disabled />
            </div>
            <div className="form-row">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={product.title} required />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={product.price.toString()}
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="oldPrice">Old Price</label>
              <input
                id="oldPrice"
                name="oldPrice"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={product.oldPrice?.toString() ?? ""}
              />
            </div>
            <div className="form-row">
              <label htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={categories.find((category) => category.slug === product.category)?.id ?? ""}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="currency">Currency</label>
              <input id="currency" name="currency" defaultValue={product.currency} required />
            </div>
            <div className="form-row">
              <label htmlFor="useCase">Use Case</label>
              <input id="useCase" name="useCase" defaultValue={product.useCase ?? ""} />
            </div>
            <div className="form-row">
              <label htmlFor="badge">Badge</label>
              <input id="badge" name="badge" defaultValue={product.badge ?? ""} />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="packQty">Pack Qty</label>
              <input
                id="packQty"
                name="packQty"
                type="number"
                min="1"
                step="1"
                defaultValue={product.packQty ?? ""}
              />
            </div>
            <div className="form-row">
              <label htmlFor="holeSize">Hole Size</label>
              <input id="holeSize" name="holeSize" defaultValue={product.holeSize ?? ""} />
            </div>
            <div className="form-row">
              <label htmlFor="sortOrder">Sort Order</label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={product.sortOrder ?? ""}
              />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="imageUrl">Image URL</label>
              <input id="imageUrl" name="imageUrl" type="url" defaultValue={product.imageUrl ?? ""} />
            </div>
            <div className="form-row">
              <label htmlFor="imageUrls">Image URLs</label>
              <input id="imageUrls" name="imageUrls" defaultValue={product.imageUrls.join(", ")} />
            </div>
            <div className="form-row">
              <label htmlFor="tags">Tags</label>
              <input id="tags" name="tags" defaultValue={product.tags.join(", ")} />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="descriptionKm">Description (KM)</label>
            <textarea
              id="descriptionKm"
              name="descriptionKm"
              rows={4}
              defaultValue={product.descriptionKm ?? ""}
            />
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="titleKm">Title (KM)</label>
              <input id="titleKm" name="titleKm" defaultValue={product.titleKm ?? ""} />
            </div>
            <div className="form-row">
              <label htmlFor="categoryLabelKm">Category Label (KM)</label>
              <input
                id="categoryLabelKm"
                name="categoryLabelKm"
                defaultValue={product.categoryLabelKm ?? ""}
              />
            </div>
            <div className="form-row">
              <label htmlFor="useCaseKm">Use Case (KM)</label>
              <input id="useCaseKm" name="useCaseKm" defaultValue={product.useCaseKm ?? ""} />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="rawCategory">Raw Category</label>
              <input id="rawCategory" name="rawCategory" defaultValue={product.rawCategory ?? ""} />
            </div>
            <div className="form-row">
              <label htmlFor="reviewFlags">Review Flags</label>
              <input id="reviewFlags" name="reviewFlags" defaultValue={product.reviewFlags.join(", ")} />
            </div>
          </div>

          <div className="form-columns">
            <label className="form-row">
              <span>In Stock</span>
              <select name="inStock" defaultValue={String(product.inStock)}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="form-row">
              <span>Active</span>
              <select name="isActive" defaultValue={String(product.isActive)}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="form-row">
              <span>Needs Review</span>
              <select name="needsReview" defaultValue={String(product.needsReview)}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="table-actions">
            <button type="submit">Update Product</button>
            <Link href="/products" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
        <ProductImagePreviewPanel
          title={product.title}
          imageUrl={product.imageUrl}
          imageUrls={product.imageUrls}
        />
      </div>
    </AdminShell>
  );
}
