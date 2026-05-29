"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@eco-bright/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@eco-bright/db";
import { changePasswordSchema, createUserSchema } from "@eco-bright/validators/user";
import { requireRole } from "@/lib/session";

function getUserErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "A user with this email already exists.";
  }

  return "Unable to save user.";
}

export async function createUserAction(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    isActive: String(formData.get("isActive") ?? "true"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect(`/users?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid data.")}`);
  }

  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: parsed.data.role,
        isActive: parsed.data.isActive === "true"
      }
    });
  } catch (error) {
    redirect(`/users?error=${encodeURIComponent(getUserErrorMessage(error))}`);
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function changeUserPasswordAction(userId: string, formData: FormData) {
  await requireRole("ADMIN");
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect(
      `/users/${userId}/password?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid password."
      )}`
    );
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      }
    });
  } catch {
    redirect(`/users/${userId}/password?error=Unable%20to%20change%20password`);
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function toggleUserActiveAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  if (!id) {
    redirect("/users?error=Missing%20user%20id");
  }

  await db.user.update({
    where: { id },
    data: {
      isActive: nextValue
    }
  });

  revalidatePath("/users");
}

export async function revokeUserSessionsAction(formData: FormData) {
  await requireRole("ADMIN");
  redirect(
    "/users?error=Session%20revocation%20is%20not%20available%20while%20the%20app%20uses%20JWT%20sessions."
  );
}
