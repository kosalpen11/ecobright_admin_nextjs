import Link from "next/link";
import { Prisma } from "@eco-bright/db";
import { deleteProductAction, toggleProductActiveAction } from "@/actions/products";
import { RowActionMenu } from "@/components/row-action-menu";
import { DataPagination, EmptyState, PageHeader, QueryError, SectionCard, StatusBadge } from "@/components/page-shell";
import { ProductImageStack } from "@/components/product-images";
import { QueryForm } from "@/components/query-form";
import { Button, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPagination } from "@/lib/pagination";
import { db } from "@eco-bright/db";

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

  const [totalProducts, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
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
        updatedAt: true,
        _count: {
          select: {
            variants: true
          }
        }
      }
    })
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        description="Legacy storefront products with admin-side stock, review, and media controls."
        action={
          <Button asChild>
            <Link href="/products/new" className="!text-white">
              New Product
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Catalog"
        description="Use server-side filtering and pagination to keep large product tables responsive."
      >
        <div className="space-y-4">
          <QueryError error={error} />

          <QueryForm className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <label htmlFor="q" className="text-sm font-medium text-slate-700">
                Search
              </label>
              <Input
                id="q"
                name="q"
                defaultValue={search}
                placeholder="Title, product ID, or category"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="active" className="text-sm font-medium text-slate-700">
                Status
              </label>
              <Select id="active" name="active" defaultValue={active ?? "all"}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium text-slate-700">
                Stock
              </label>
              <Select id="stock" name="stock" defaultValue={stock ?? "all"}>
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
                <option value="low">Low Stock</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium text-slate-700">
                Review
              </label>
              <Select id="review" name="review" defaultValue={review ?? "all"}>
                <option value="all">All</option>
                <option value="yes">Needs Review</option>
                <option value="no">Reviewed</option>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <input type="hidden" name="pageSize" value={String(pageSize)} />
              <Button type="submit" className="flex-1 lg:flex-none">
                Apply
              </Button>
              <Button asChild variant="outline" className="flex-1 lg:flex-none">
                <Link href="/products">Reset</Link>
              </Button>
            </div>
          </QueryForm>

          {products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Adjust the filters or create a product to populate the catalog."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-[220px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-start gap-4">
                            <ProductImageStack
                              title={product.title}
                              imageUrl={product.imageUrl}
                              imageUrls={product.imageUrls}
                            />
                            <div className="space-y-1">
                              <div className="font-medium text-slate-900">{product.title}</div>
                              <div className="text-xs text-slate-500">{product.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-slate-900">{product.categoryLabel}</div>
                            <div className="text-xs text-slate-500">{product.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900">
                              {formatCurrency(product.price.toString(), product.currency)}
                            </div>
                            {product.oldPrice ? (
                              <div className="text-xs text-slate-500">
                                Was {formatCurrency(product.oldPrice.toString(), product.currency)}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {product._count?.variants ?? 0}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div>{product.stockQty}</div>
                          {product._count?.variants > 0 ? (
                            <div className="text-xs text-slate-500">Variant total</div>
                          ) : (
                            <div className="text-xs text-slate-500">Product stock</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge tone={product.isActive ? "success" : "default"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </StatusBadge>
                            <StatusBadge tone={product.inStock ? "success" : "destructive"}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </StatusBadge>
                            {product.stockQty > 0 && product.stockQty <= 5 ? (
                              <StatusBadge tone="warning">Low Stock</StatusBadge>
                            ) : null}
                            {product.needsReview ? (
                              <StatusBadge tone="warning">Needs Review</StatusBadge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDateTime(product.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <RowActionMenu
                              title="Delete product"
                              editHref={`/products/${product.id}/edit`}
                              toggleLabel={product.isActive ? "Deactivate" : "Activate"}
                              toggleAction={toggleProductActiveAction}
                              toggleFields={{
                                id: product.id,
                                nextValue: product.isActive ? "false" : "true"
                              }}
                              deleteAction={deleteProductAction}
                              deleteFields={{ id: product.id }}
                              deleteDescription="Delete is blocked when stock movement history already exists."
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataPagination
                basePath="/products"
                page={page}
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
        </div>
      </SectionCard>
    </>
  );
}
