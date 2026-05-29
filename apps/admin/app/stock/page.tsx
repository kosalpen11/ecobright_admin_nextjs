import { Prisma } from "@eco-bright/db";
import Link from "next/link";
import { db } from "@eco-bright/db";
import { createStockMovementAction } from "@/actions/stock";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination, EmptyState, PageHeader, QueryError, SectionCard, StatusBadge } from "@/components/page-shell";
import { Button, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { getPagination } from "@/lib/pagination";
import { requireAuth } from "@/lib/session";

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

  const movementAnd: Prisma.StockMovementWhereInput[] = [];

  if (type && type !== "all") {
    movementAnd.push({
      type: type as "IN" | "OUT" | "ADJUSTMENT"
    });
  }

  if (productFilter) {
    movementAnd.push({
      OR: [
        { productId: { contains: productFilter, mode: "insensitive" } },
        {
          product: {
            title: { contains: productFilter, mode: "insensitive" }
          }
        }
      ]
    });
  }

  if (search) {
    movementAnd.push({
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
    });
  }

  const movementWhere: Prisma.StockMovementWhereInput =
    movementAnd.length > 0 ? { AND: movementAnd } : {};

  const productPickerWhere: Prisma.ProductWhereInput = productFilter
    ? {
        OR: [
          { id: { contains: productFilter, mode: "insensitive" } },
          { title: { contains: productFilter, mode: "insensitive" } }
        ]
      }
    : {};

  const [products, totalMovements, movements] = await Promise.all([
    db.product.findMany({
      where: productPickerWhere,
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        stockQty: true
      }
    }),
    db.stockMovement.count({
      where: movementWhere
    }),
    db.stockMovement.findMany({
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
    <AdminShell currentPath="/stock">
      <PageHeader
        title="Stock Movement"
        description="Server-calculated stock updates with a durable movement history."
        action={
          <Button asChild variant="outline">
            <Link href="/products">Open Products</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard
          title="New Movement"
          description="Stock quantity is always recalculated on the server."
        >
          <div className="space-y-5">
            <form method="GET" className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="space-y-2">
                <label htmlFor="product" className="text-sm font-medium text-slate-700">
                  Product Search
                </label>
                <Input
                  id="product"
                  name="product"
                  defaultValue={productFilter}
                  placeholder="Filter product picker by title or ID"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="hidden" name="pageSize" value={String(pageSize)} />
                {search ? <input type="hidden" name="q" value={search} /> : null}
                {type && type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
                <Button type="submit" size="sm">
                  Filter
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/stock">Reset</Link>
                </Button>
              </div>
            </form>

            <form action={createStockMovementAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="productId" className="text-sm font-medium text-slate-700">
                  Product
                </label>
                <Select id="productId" name="productId" defaultValue="" required>
                  <option value="" disabled>
                    Select a product
                  </option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.id}) - {item.stockQty} in stock
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <Select id="type" name="type" defaultValue="IN" required>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="ADJUSTMENT">ADJUST</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                    Quantity
                  </label>
                  <Input id="quantity" name="quantity" type="number" min="1" step="1" required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="note" className="text-sm font-medium text-slate-700">
                  Note
                </label>
                <Textarea id="note" name="note" rows={4} />
              </div>

              <QueryError error={error} />

              <Button type="submit">Save Movement</Button>
            </form>
          </div>
        </SectionCard>

        <SectionCard
          title="Movement History"
          description="Search the audit trail by product, note, or operator."
        >
          <div className="space-y-4">
            <form method="GET" className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <label htmlFor="q" className="text-sm font-medium text-slate-700">
                  Search
                </label>
                <Input
                  id="q"
                  name="q"
                  defaultValue={search}
                  placeholder="Note, actor, product title, or product ID"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="historyType" className="text-sm font-medium text-slate-700">
                  Type
                </label>
                <Select id="historyType" name="type" defaultValue={type ?? "all"}>
                  <option value="all">All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="ADJUSTMENT">ADJUST</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="historyProduct" className="text-sm font-medium text-slate-700">
                  Product
                </label>
                <Input
                  id="historyProduct"
                  name="product"
                  defaultValue={productFilter}
                  placeholder="Filter by product"
                />
              </div>
              <div className="flex items-end gap-2">
                <input type="hidden" name="pageSize" value={String(pageSize)} />
                <Button type="submit" className="flex-1 lg:flex-none">
                  Apply
                </Button>
                <Button asChild variant="outline" className="flex-1 lg:flex-none">
                  <Link href="/stock">Reset</Link>
                </Button>
              </div>
            </form>

            {movements.length === 0 ? (
              <EmptyState
                title="No stock movement history"
                description="Adjust filters or record a movement to build the audit trail."
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead>At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-slate-900">{movement.product.title}</div>
                              <div className="text-xs text-slate-500">{movement.product.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              tone={
                                movement.type === "OUT"
                                  ? "warning"
                                  : movement.type === "ADJUSTMENT"
                                    ? "default"
                                    : "success"
                              }
                            >
                              {movement.type}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{movement.quantity}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {movement.previousStock} to {movement.newStock}
                          </TableCell>
                          <TableCell className="max-w-xs text-sm text-slate-600">
                            {movement.note || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {movement.createdBy.name}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formatDateTime(movement.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DataPagination
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
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
