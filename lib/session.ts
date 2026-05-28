import { auth } from "@/auth";
import { redirect } from "next/navigation";

const roleRank = {
  STAFF: 1,
  ADMIN: 2
} as const;

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

export async function requireRole(requiredRole: "ADMIN" | "STAFF" | Array<"ADMIN" | "STAFF">) {
  const user = await requireAuth();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.some((role) => roleRank[user.role] >= roleRank[role])) {
    redirect("/dashboard");
  }

  return user;
}
