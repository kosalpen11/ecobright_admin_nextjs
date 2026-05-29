import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin-shell";
import {
  EmptyState,
  PageSection,
  Pagination,
  StatusPill
} from "@/components/ui";
import { ProductImageStack } from "@/components/product-images";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { deleteProductAction } from "@/app/products/actions";

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD"
  }).format(Number(value));
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    page?: string;
    pageSize?: string;
    q?: string;
    active?: string;
    stock?: string;
    review?: string;
  }>;
}) {
  await requireAuth();
  const {
    error,
    page: pageParam,
    pageSize: pageSizeParam,
    q,
    active,
    stock,
    review
  } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);
  const search = q?.trim() ?? "";

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { id: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { categoryLabel: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(active === "active"
      ? { isActive: true }
      : active === "inactive"
        ? { isActive: false }
        : {}),
    ...(stock === "in"
      ? { inStock: true }
      : stock === "out"
        ? { inStock: false }
        : stock === "low"
          ? { stockQty: { lte: 5 } }
          : {}),
    ...(review === "yes"
      ? { needsReview: true }
      : review === "no"
        ? { needsReview: false }
        : {})
  };

  const [totalProducts, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageUrls: true,
        category: true,
        categoryLabel: true,
        price: true,
        oldPrice: true,
        currency: true,
        stockQty: true,
        inStock: true,
        isActive: true,
        needsReview: true,
        updatedAt: true
      }
    })
  ]);

  const totalPages = getTotalPages(totalProducts, pageSize);
  const currentPage = Math.min(page, totalPages);

  return (
    <AdminShell
      title="Products"
      description="Legacy storefront products with admin-side stock and review controls."
      currentPath="/products"
    >
      <PageSection
        title="Catalog"
        description="Use paged reads to keep the product list responsive as the catalog grows."
        action={
          <Link href="/products/new" className="button-link primary">
            New Product
          </Link>
        }
      >
        {error ? <p className="error-text">{error}</p> : null}

        <form method="GET" className="products-filter-bar">
          <div className="products-filter-grid">
            <div className="form-row">
              <label htmlFor="q">Search</label>
              <input
                id="q"
                name="q"
                defaultValue={search}
                placeholder="Search title, product ID, or category"
              />
            </div>
            <div className="form-row">
              <label htmlFor="active">Status</label>
              <select id="active" name="active" defaultValue={active ?? "all"}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="stock">Stock</label>
              <select id="stock" name="stock" defaultValue={stock ?? "all"}>
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
                <option value="low">Low Stock</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="review">Review</label>
              <select id="review" name="review" defaultValue={review ?? "all"}>
                <option value="all">All</option>
                <option value="yes">Needs Review</option>
                <option value="no">Reviewed</option>
              </select>
            </div>
          </div>

          <div className="table-actions">
            <input type="hidden" name="pageSize" value={String(pageSize)} />
            <button type="submit">Apply Filters</button>
            <Link href="/products" className="button-link secondary">
              Reset
            </Link>
          </div>
        </form>

        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Adjust the filters or create a new product to populate the catalog."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-table-cell">
                          <ProductImageStack
                            title={product.title}
                            imageUrl={product.imageUrl}
                            imageUrls={product.imageUrls}
                          />
                          <div>
                            <strong>{product.title}</strong>
                            <div className="muted">{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{product.categoryLabel}</div>
                        <div className="muted">{product.category}</div>
                      </td>
                      <td>
                        <strong>{formatCurrency(product.price.toString(), product.currency)}</strong>
                        {product.oldPrice ? (
                          <div className="muted">
                            Was {formatCurrency(product.oldPrice.toString(), product.currency)}
                          </div>
                        ) : null}
                      </td>
                      <td>{product.stockQty}</td>
                      <td>
                        <div className="table-actions">
                          <StatusPill tone={product.isActive ? "success" : "default"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </StatusPill>
                          <StatusPill tone={product.inStock ? "success" : "warning"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </StatusPill>
                          {product.needsReview ? (
                            <StatusPill tone="warning">Needs Review</StatusPill>
                          ) : null}
                        </div>
                      </td>
                      <td>{product.updatedAt.toLocaleString()}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/products/${product.id}/edit`} className="button-link secondary small">
                            Edit
                          </Link>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <button type="submit" className="danger small">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              basePath="/products"
              page={currentPage}
              pageSize={pageSize}
              totalItems={totalProducts}
              extraParams={{
                ...(error ? { error } : {}),
                ...(search ? { q: search } : {}),
                ...(active && active !== "all" ? { active } : {}),
                ...(stock && stock !== "all" ? { stock } : {}),
                ...(review && review !== "all" ? { review } : {})
              }}
            />
          </>
        )}
      </PageSection>
    </AdminShell>
  );
}
