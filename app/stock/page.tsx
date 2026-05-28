import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Prisma } from "@prisma/client";
import { EmptyState, PageSection, Pagination } from "@/components/ui";
import { getPagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { createStockMovementAction } from "@/app/stock/actions";

export default async function StockPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    page?: string;
    pageSize?: string;
    q?: string;
    type?: string;
    product?: string;
  }>;
}) {
  await requireAuth();
  const {
    error,
    page: pageParam,
    pageSize: pageSizeParam,
    q,
    type,
    product
  } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);
  const search = q?.trim() ?? "";
  const productFilter = product?.trim() ?? "";

  const movementWhere: Prisma.StockMovementWhereInput = {
    ...(type && type !== "all"
      ? {
          type: type as "IN" | "OUT" | "ADJUSTMENT"
        }
      : {}),
    ...(productFilter
      ? {
          OR: [
            { productId: { contains: productFilter, mode: "insensitive" } },
            {
              product: {
                title: { contains: productFilter, mode: "insensitive" }
              }
            }
          ]
        }
      : {}),
    ...(search
      ? {
          OR: [
            { note: { contains: search, mode: "insensitive" } },
            {
              createdBy: {
                name: { contains: search, mode: "insensitive" }
              }
            },
            {
              product: {
                title: { contains: search, mode: "insensitive" }
              }
            },
            {
              product: {
                id: { contains: search, mode: "insensitive" }
              }
            }
          ]
        }
      : {})
  };

  const productPickerWhere: Prisma.ProductWhereInput = productFilter
    ? {
        OR: [
          { id: { contains: productFilter, mode: "insensitive" } },
          { title: { contains: productFilter, mode: "insensitive" } }
        ]
      }
    : {};

  const [products, totalMovements, movements] = await Promise.all([
    prisma.product.findMany({
      where: productPickerWhere,
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        stockQty: true
      }
    }),
    prisma.stockMovement.count({
      where: movementWhere
    }),
    prisma.stockMovement.findMany({
      where: movementWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        },
        createdBy: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  return (
    <AdminShell
      title="Stock Movement"
      description="Server-calculated inventory updates with an audited movement log."
      currentPath="/stock"
    >
      <div className="grid" style={{ gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)" }}>
        <PageSection
          title="New Movement"
          description="Stock is recalculated on the server and never trusted from the client."
        >
          <form method="GET" className="products-filter-bar" style={{ marginBottom: 18 }}>
            <div className="products-filter-grid">
              <div className="form-row">
                <label htmlFor="product">Product Search</label>
                <input
                  id="product"
                  name="product"
                  defaultValue={productFilter}
                  placeholder="Filter product picker by title or ID"
                />
              </div>
            </div>
            <div className="table-actions">
              <input type="hidden" name="pageSize" value={String(pageSize)} />
              {search ? <input type="hidden" name="q" value={search} /> : null}
              {type && type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
              <button type="submit">Filter Product Picker</button>
              <Link href="/stock" className="button-link secondary">
                Reset
              </Link>
            </div>
          </form>

          <form action={createStockMovementAction} className="form-grid">
            <div className="form-row">
              <label htmlFor="productId">Product</label>
              <select id="productId" name="productId" defaultValue="" required>
                <option value="" disabled>
                  Select a product
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} ({product.id}) - {product.stockQty} in stock
                  </option>
                ))}
              </select>
            </div>

            <div className="form-columns">
              <div className="form-row">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" defaultValue="IN" required>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="1" step="1" required />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="note">Note</label>
              <textarea id="note" name="note" rows={4} />
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <button type="submit">Save Movement</button>
          </form>
        </PageSection>

        <PageSection
          title="Movement History"
          description="Paged activity history avoids loading the full audit trail into one response."
        >
          <form method="GET" className="products-filter-bar">
            <div className="products-filter-grid">
              <div className="form-row">
                <label htmlFor="q">Search</label>
                <input
                  id="q"
                  name="q"
                  defaultValue={search}
                  placeholder="Search note, actor, product title, or product ID"
                />
              </div>
              <div className="form-row">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" defaultValue={type ?? "all"}>
                  <option value="all">All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="productHistory">Product</label>
                <input
                  id="productHistory"
                  name="product"
                  defaultValue={productFilter}
                  placeholder="Filter by product title or ID"
                />
              </div>
            </div>

            <div className="table-actions">
              <input type="hidden" name="pageSize" value={String(pageSize)} />
              <button type="submit">Apply Filters</button>
              <Link href="/stock" className="button-link secondary">
                Reset
              </Link>
            </div>
          </form>

          {movements.length === 0 ? (
            <EmptyState
              title="No stock movement history"
              description="Adjust filters or record a movement to build the stock audit trail."
            />
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Note</th>
                      <th>By</th>
                      <th>At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          <strong>{movement.product.title}</strong>
                          <div className="muted">{movement.product.id}</div>
                        </td>
                        <td>{movement.type}</td>
                        <td>{movement.quantity}</td>
                        <td>{movement.note || "-"}</td>
                        <td>{movement.createdBy.name}</td>
                        <td>{movement.createdAt.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                basePath="/stock"
                page={page}
                pageSize={pageSize}
                totalItems={totalMovements}
                extraParams={{
                  ...(error ? { error } : {}),
                  ...(search ? { q: search } : {}),
                  ...(type && type !== "all" ? { type } : {}),
                  ...(productFilter ? { product: productFilter } : {})
                }}
              />
            </>
          )}
        </PageSection>
      </div>
    </AdminShell>
  );
}
