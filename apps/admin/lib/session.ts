import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  requiredRole: "ADMIN" | "STAFF" | Array<"ADMIN" | "STAFF">
) {
  const user = await requireAuth();
  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowed.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
