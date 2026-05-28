import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { EmptyState, PageSection, Pagination, StatusPill, StatCard } from "@/components/ui";
import { createUserAction } from "@/app/users/actions";
import { getPagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; page?: string; pageSize?: string }>;
}) {
  await requireRole("ADMIN");
  const { error, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);

  const [totalUsers, adminCount, staffCount, activeCount, users] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return (
    <AdminShell
      title="Users"
      description="Admin-only account management for back-office access."
      currentPath="/users"
    >
      <div className="grid stats-grid">
        <StatCard label="Total Users" value={totalUsers} hint="Accounts allowed to access the admin." />
        <StatCard label="Admins" value={adminCount} hint="Users with full control over the system." />
        <StatCard label="Staff" value={staffCount} hint="Operational users with limited privileges." />
        <StatCard label="Active" value={activeCount} hint="Accounts currently able to sign in." />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)" }}>
        <PageSection title="Create User" description="Create a new admin or staff account with a secure initial password.">
          <form action={createUserAction} className="form-grid">
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required />
            </div>

            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>

            <div className="form-columns">
              <div className="form-row">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" defaultValue="STAFF" required>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="isActive">Active</label>
                <select id="isActive" name="isActive" defaultValue="true" required>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="password">Initial Password</label>
              <input id="password" name="password" type="password" minLength={8} required />
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <button type="submit">Create User</button>
          </form>
        </PageSection>

        <PageSection title="User Directory" description="View account status, role assignment, and reset passwords when needed.">
          {users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Create the first admin or staff account to populate the directory."
            />
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                          <div className="muted">{user.email}</div>
                        </td>
                        <td>
                          <StatusPill tone={user.role === "ADMIN" ? "default" : "success"}>
                            {user.role}
                          </StatusPill>
                        </td>
                        <td>
                          <StatusPill tone={user.isActive ? "success" : "warning"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </StatusPill>
                        </td>
                        <td>{user.createdAt.toLocaleString()}</td>
                        <td>
                          <Link href={`/users/${user.id}/password`} className="button-link secondary small">
                            Change Password
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                basePath="/users"
                page={page}
                pageSize={pageSize}
                totalItems={totalUsers}
                extraParams={error ? { error } : undefined}
              />
            </>
          )}
        </PageSection>
      </div>
    </AdminShell>
  );
}
