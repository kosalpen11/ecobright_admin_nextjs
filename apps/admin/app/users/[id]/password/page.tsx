import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@eco-bright/db";
import { changeUserPasswordAction } from "@/actions/users";
import { AdminShell } from "@/components/admin-shell";
import { PageHeader, QueryError, SectionCard } from "@/components/page-shell";
import { Button, Input } from "@/components/ui";
import { requireRole } from "@/lib/session";

export default async function UserPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const { error } = await searchParams;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  if (!user) {
    notFound();
  }

  const action = changeUserPasswordAction.bind(null, id);

  return (
    <AdminShell currentPath="/users">
      <PageHeader
        title="Change Password"
        description={`Set a new password for ${user.name}. Password hashes stay server-side only.`}
        action={
          <Button asChild variant="outline">
            <Link href="/users">Back to Users</Link>
          </Button>
        }
      />

      <SectionCard title="Password Reset" description={user.email}>
        <form action={action} className="max-w-md space-y-5">
          <QueryError error={error} />

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              New Password
            </label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Update Password</Button>
            <Button asChild variant="outline">
              <Link href="/users">Cancel</Link>
            </Button>
          </div>
        </form>
      </SectionCard>
    </AdminShell>
  );
}
