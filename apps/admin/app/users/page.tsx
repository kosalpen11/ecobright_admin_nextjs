import Link from "next/link";
import { db } from "@eco-bright/db";
import { createUserAction, revokeUserSessionsAction, toggleUserActiveAction } from "@/actions/users";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmDialogForm, Button, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { DataPagination, EmptyState, PageHeader, QueryError, SectionCard, StatCard, StatusBadge } from "@/components/page-shell";
import { formatDateTime } from "@/lib/format";
import { getPagination } from "@/lib/pagination";
import { requireRole } from "@/lib/session";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; page?: string; pageSize?: string }>;
}) {
  await requireRole("ADMIN");
  const { error, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);

  const [totalUsers, adminCount, staffCount, activeCount, users] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { role: "STAFF" } }),
    db.user.count({ where: { isActive: true } }),
    db.user.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
  ]);

  return (
    <AdminShell currentPath="/users">
      <PageHeader
        title="Users"
        description="Admin-only account management backed by database sessions."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} hint="Accounts allowed to access the admin." />
        <StatCard label="Admins" value={adminCount} hint="Users with full control over the console." />
        <StatCard label="Staff" value={staffCount} hint="Operational accounts with limited access." />
        <StatCard label="Active" value={activeCount} hint="Accounts currently allowed to sign in." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard
          title="Create User"
          description="Create a new admin or staff account with a secure initial password."
        >
          <form action={createUserAction} className="space-y-4">
            <QueryError error={error} />

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <Select id="role" name="role" defaultValue="STAFF" required>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Active
                </label>
                <Select id="isActive" name="isActive" defaultValue="true" required>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Initial Password
              </label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>

            <Button type="submit">Create User</Button>
          </form>
        </SectionCard>

        <SectionCard
          title="User Directory"
          description="Change passwords and disable access for admin users."
        >
          {users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Create the first admin or staff account to populate the directory."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[220px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={user.role === "ADMIN" ? "default" : "success"}>
                            {user.role}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={user.isActive ? "success" : "warning"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDateTime(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/users/${user.id}/password`}>Change Password</Link>
                            </Button>
                            <ConfirmDialogForm
                              triggerLabel={user.isActive ? "Deactivate" : "Activate"}
                              title={user.isActive ? "Deactivate user" : "Activate user"}
                              description="Deactivating blocks future sign-in for this user."
                              action={toggleUserActiveAction}
                              hiddenFields={{
                                id: user.id,
                                nextValue: user.isActive ? "false" : "true"
                              }}
                              confirmLabel={user.isActive ? "Deactivate" : "Activate"}
                              triggerVariant={user.isActive ? "secondary" : "outline"}
                              confirmVariant={user.isActive ? "destructive" : "default"}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataPagination
                basePath="/users"
                page={page}
                pageSize={pageSize}
                totalItems={totalUsers}
                extraParams={error ? { error } : undefined}
              />
            </>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
