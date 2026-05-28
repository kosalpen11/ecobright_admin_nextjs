"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { changePasswordSchema, createUserSchema } from "@/lib/validations/user";

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
    await prisma.user.create({
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
    await prisma.user.update({
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
