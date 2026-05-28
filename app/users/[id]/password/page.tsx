import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { PageSection } from "@/components/ui";
import { changeUserPasswordAction } from "@/app/users/actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function ChangeUserPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("ADMIN");
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title="Change Password"
      description="Reset an existing admin or staff account password."
      currentPath="/users"
    >
      <PageSection
        title={user.name}
        description={`${user.email} · ${user.role}`}
        action={
          <Link href="/users" className="button-link secondary">
            Back to Users
          </Link>
        }
      >
        <form action={changeUserPasswordAction.bind(null, user.id)} className="form-grid">
          <div className="form-row">
            <label htmlFor="password">New Password</label>
            <input id="password" name="password" type="password" minLength={8} required />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="table-actions">
            <button type="submit">Update Password</button>
            <Link href="/users" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </PageSection>
    </AdminShell>
  );
}
