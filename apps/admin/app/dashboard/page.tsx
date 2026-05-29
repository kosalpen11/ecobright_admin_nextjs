import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { db } from "@eco-bright/db";
import { AdminShell } from "@/components/admin-shell";
import { EmptyState, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/page-shell";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { requireAuth } from "@/lib/session";

export default async function DashboardPage() {
  const currentUser = await requireAuth();

  const [
    productCount,
    categoryCount,
    lowStockCount,
    outOfStockCount,
    recentMovements,
    lowStockProducts,
    recentUsers
  ] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.product.count({
      where: {
        stockQty: {
          gt: 0,
          lte: 5
        }
      }
    }),
    db.product.count({
      where: {
        stockQty: 0
      }
    }),
    db.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        quantity: true,
        previousStock: true,
        newStock: true,
        createdAt: true,
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
    }),
    db.product.findMany({
      where: {
        stockQty: {
          lte: 5
        }
      },
      orderBy: [{ stockQty: "asc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        stockQty: true,
        isActive: true,
        inStock: true
      }
    }),
    currentUser.role === "ADMIN"
      ? db.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        })
      : Promise.resolve([])
  ]);

  return (
    <AdminShell currentPath="/dashboard">
      <PageHeader
        title="Dashboard"
        description="A focused view of product coverage, stock pressure, and recent admin activity."
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/products">View Products</Link>
            </Button>
            <Button
              asChild
              className="min-w-[152px] justify-between gap-3 shadow-sm shadow-slate-900/15"
            >
              <Link href="/stock" className="!text-white [&_svg]:!text-white [&_span]:!text-white">
                <span className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 shrink-0" />
                  <span>Record Stock</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={productCount} hint="Legacy catalog rows under admin control." />
        <StatCard label="Total Categories" value={categoryCount} hint="Managed normalization dictionary." />
        <StatCard label="Low Stock" value={lowStockCount} hint="Products with five units or fewer." />
        <StatCard label="Out of Stock" value={outOfStockCount} hint="Products currently unavailable." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Recent Stock Movement"
          description="Latest inventory updates recorded by the operations team."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/stock">View all</Link>
            </Button>
          }
        >
          {recentMovements.length === 0 ? (
            <EmptyState
              title="No stock activity yet"
              description="Create the first stock movement to start the audit trail."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => (
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
                      <TableCell className="text-sm text-slate-600">
                        {movement.previousStock} to {movement.newStock}
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
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Low-Stock Priority"
            description="Items that need replenishment or review first."
          >
            {lowStockProducts.length === 0 ? (
              <EmptyState
                title="No low-stock products"
                description="Products with low or zero inventory will surface here."
              />
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{product.title}</div>
                      <div className="text-xs text-slate-500">{product.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={product.stockQty === 0 ? "destructive" : "warning"}>
                        {product.stockQty === 0 ? "Out of Stock" : `${product.stockQty} left`}
                      </StatusBadge>
                      {!product.isActive ? <StatusBadge>Inactive</StatusBadge> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {currentUser.role === "ADMIN" ? (
            <SectionCard
              title="New Team Members"
              description="Recently added admin accounts."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/users">Manage users</Link>
                </Button>
              }
            >
              {recentUsers.length === 0 ? (
                <EmptyState
                  title="No users yet"
                  description="Create staff or admin accounts to populate the directory."
                />
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={user.role === "ADMIN" ? "default" : "success"}>
                          {user.role}
                        </StatusBadge>
                        <StatusBadge tone={user.isActive ? "success" : "warning"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
