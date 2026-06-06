import { AdminShell } from "@/components/admin-shell";
import { requireAuth } from "@/lib/session";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return <AdminShell user={user}>{children}</AdminShell>;
}
