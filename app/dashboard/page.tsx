import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { EmptyState, PageSection, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

function formatDate(value: Date) {
  return value.toLocaleString();
}

function KpiCard({
  label,
  value,
  meta
}: {
  label: string;
  value: string | number;
  meta: string;
}) {
  return (
    <div className="dashboard-kpi">
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-hint">{meta}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const currentUser = await requireAuth();

  const [
    productCount,
    categoryCount,
    stockMovementCount,
    totalStock,
    outOfStockCount,
    reviewCount,
    lowStockProducts,
    recentMovements,
    recentUsers
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.stockMovement.count(),
    prisma.product.aggregate({
      _sum: {
        stockQty: true
      }
    }),
    prisma.product.count({
      where: {
        inStock: false
      }
    }),
    prisma.product.count({
      where: {
        needsReview: true
      }
    }),
    prisma.product.findMany({
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
        inStock: true,
        needsReview: true,
        updatedAt: true
      }
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        quantity: true,
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
    currentUser.role === "ADMIN"
      ? prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        })
      : Promise.resolve([])
  ]);

  const currentUnits = totalStock._sum.stockQty ?? 0;

  return (
    <AdminShell
      title="Dashboard"
      description="A focused view of inventory risk, activity, and team access."
      currentPath="/dashboard"
    >
      <section className="dashboard-hero">
        <div className="dashboard-hero__intro">
          <p className="dashboard-eyebrow">Operations Overview</p>
          <h2 className="dashboard-hero__title">Keep the catalog healthy and the team moving.</h2>
          <p className="dashboard-hero__copy">
            Track stock pressure, review backlog, and recent admin activity from one screen.
          </p>
          <div className="table-actions">
            <Link href="/stock" className="button-link">
              Record Stock
            </Link>
            <Link href="/products" className="button-link">
              View Products
            </Link>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <KpiCard label="Products" value={productCount} meta="Managed legacy catalog rows." />
          <KpiCard label="Current Units" value={currentUnits} meta="Tracked stock across products." />
          <KpiCard label="Out of Stock" value={outOfStockCount} meta="Products unavailable for sale." />
          <KpiCard label="Needs Review" value={reviewCount} meta="Rows still needing attention." />
        </div>
      </section>

      <div className="grid dashboard-main-grid">
        <PageSection title="Priority Queue" description="Items that need action first.">
          <div className="dashboard-priority-grid">
            <div className="health-card">
              <p className="stat-label">Categories</p>
              <div className="stat-value">{categoryCount}</div>
              <p className="stat-hint">Normalization dictionary available for mapping.</p>
            </div>
            <div className="health-card">
              <p className="stat-label">Stock Movements</p>
              <div className="stat-value">{stockMovementCount}</div>
              <p className="stat-hint">Audited stock events recorded by the team.</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <EmptyState
              title="No low-stock items"
              description="Products with low inventory will surface here for fast follow-up."
            />
          ) : (
            <div className="stack">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="list-row">
                  <div>
                    <strong>{product.title}</strong>
                    <div className="muted">{product.id}</div>
                    <div className="muted">Updated {formatDate(product.updatedAt)}</div>
                  </div>
                  <div className="table-actions">
                    <StatusPill tone={product.stockQty === 0 ? "danger" : "warning"}>
                      {product.stockQty} units
                    </StatusPill>
                    {!product.inStock ? <StatusPill tone="danger">Out</StatusPill> : null}
                    {product.needsReview ? <StatusPill tone="warning">Review</StatusPill> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection title="Quick Actions" description="Shortcuts for the admin workflows used most often.">
          <div className="quick-actions-grid">
            <Link href="/products/new" className="quick-action-card">
              <strong>New Product</strong>
              <span className="muted">Create a product row with category mapping and media.</span>
            </Link>
            <Link href="/categories/new" className="quick-action-card">
              <strong>New Category</strong>
              <span className="muted">Expand the category dictionary for legacy product mapping.</span>
            </Link>
            <Link href="/stock" className="quick-action-card">
              <strong>Record Stock</strong>
              <span className="muted">Write an audited stock movement on the server.</span>
            </Link>
            {currentUser.role === "ADMIN" ? (
              <Link href="/users" className="quick-action-card">
                <strong>Manage Users</strong>
                <span className="muted">Create accounts and reset passwords for admin access.</span>
              </Link>
            ) : null}
          </div>
        </PageSection>
      </div>

      <div className="grid dashboard-main-grid">
        <PageSection title="Recent Stock Activity" description="Latest inventory changes from the operations team.">
          {recentMovements.length === 0 ? (
            <EmptyState
              title="No stock activity yet"
              description="Create the first stock movement to start the audit trail."
            />
          ) : (
            <div className="stack">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="list-row">
                  <div>
                    <strong>{movement.product.title}</strong>
                    <div className="muted">{movement.product.id}</div>
                  </div>
                  <div className="dashboard-activity-meta">
                    <StatusPill tone="default">{movement.type}</StatusPill>
                    <span className="muted">{movement.quantity} units</span>
                    <span className="muted">{movement.createdBy.name}</span>
                    <span className="muted">{formatDate(movement.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        {currentUser.role === "ADMIN" ? (
          <PageSection title="Recent Users" description="Newest admin-side accounts with access to this console.">
            {recentUsers.length === 0 ? (
              <EmptyState
                title="No users found"
                description="Create admin or staff accounts to populate the access roster."
              />
            ) : (
              <div className="stack">
                {recentUsers.map((user) => (
                  <div key={user.id} className="list-row">
                    <div>
                      <strong>{user.name}</strong>
                      <div className="muted">{user.email}</div>
                    </div>
                    <div className="table-actions">
                      <StatusPill tone={user.role === "ADMIN" ? "default" : "success"}>
                        {user.role}
                      </StatusPill>
                      <StatusPill tone={user.isActive ? "success" : "warning"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </StatusPill>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageSection>
        ) : null}
      </div>
    </AdminShell>
  );
}
