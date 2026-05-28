import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { ProductImagePreviewPanel } from "@/components/product-images";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { createProductAction } from "@/app/products/actions";

export default async function NewProductPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <AdminShell title="New Product" currentPath="/products">
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
      <div className="panel">
        <form action={createProductAction} className="form-grid">
          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="id">Product ID</label>
              <input id="id" name="id" required />
            </div>
            <div className="form-row">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" required />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" min="0.01" step="0.01" required />
            </div>
            <div className="form-row">
              <label htmlFor="oldPrice">Old Price</label>
              <input id="oldPrice" name="oldPrice" type="number" min="0.01" step="0.01" />
            </div>
            <div className="form-row">
              <label htmlFor="categoryId">Category</label>
              <select id="categoryId" name="categoryId" defaultValue="" required>
                <option value="" disabled>
                  Select a category
                </option>
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
              <input id="currency" name="currency" defaultValue="USD" required />
            </div>
            <div className="form-row">
              <label htmlFor="useCase">Use Case</label>
              <input id="useCase" name="useCase" />
            </div>
            <div className="form-row">
              <label htmlFor="badge">Badge</label>
              <input id="badge" name="badge" />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="packQty">Pack Qty</label>
              <input id="packQty" name="packQty" type="number" min="1" step="1" />
            </div>
            <div className="form-row">
              <label htmlFor="holeSize">Hole Size</label>
              <input id="holeSize" name="holeSize" />
            </div>
            <div className="form-row">
              <label htmlFor="sortOrder">Sort Order</label>
              <input id="sortOrder" name="sortOrder" type="number" step="1" />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="imageUrl">Image URL</label>
              <input id="imageUrl" name="imageUrl" type="url" />
            </div>
            <div className="form-row">
              <label htmlFor="imageUrls">Image URLs</label>
              <input id="imageUrls" name="imageUrls" placeholder="url1, url2" />
            </div>
            <div className="form-row">
              <label htmlFor="tags">Tags</label>
              <input id="tags" name="tags" placeholder="eco, bright, featured" />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} required />
          </div>

          <div className="form-row">
            <label htmlFor="descriptionKm">Description (KM)</label>
            <textarea id="descriptionKm" name="descriptionKm" rows={4} />
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="titleKm">Title (KM)</label>
              <input id="titleKm" name="titleKm" />
            </div>
            <div className="form-row">
              <label htmlFor="categoryLabelKm">Category Label (KM)</label>
              <input id="categoryLabelKm" name="categoryLabelKm" />
            </div>
            <div className="form-row">
              <label htmlFor="useCaseKm">Use Case (KM)</label>
              <input id="useCaseKm" name="useCaseKm" />
            </div>
          </div>

          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="rawCategory">Raw Category</label>
              <input id="rawCategory" name="rawCategory" />
            </div>
            <div className="form-row">
              <label htmlFor="reviewFlags">Review Flags</label>
              <input id="reviewFlags" name="reviewFlags" placeholder="duplicate, image-missing" />
            </div>
          </div>

          <div className="form-columns">
            <label className="form-row">
              <span>In Stock</span>
              <select name="inStock" defaultValue="true">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="form-row">
              <span>Active</span>
              <select name="isActive" defaultValue="true">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="form-row">
              <span>Needs Review</span>
              <select name="needsReview" defaultValue="false">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="table-actions">
            <button type="submit">Save Product</button>
            <Link href="/products" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
        <ProductImagePreviewPanel title="New Product" />
      </div>
    </AdminShell>
  );
}
