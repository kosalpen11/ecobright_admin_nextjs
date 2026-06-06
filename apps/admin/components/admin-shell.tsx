import { AdminChrome } from "@/components/admin-chrome";

export async function AdminShell({
  user,
  children
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "STAFF";
  } | null;
  children: React.ReactNode;
}) {
  return <AdminChrome user={user}>{children}</AdminChrome>;
}
