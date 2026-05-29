"use server";

import { Prisma } from "@eco-bright/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@eco-bright/db";
import { categorySchema } from "@eco-bright/validators/category";
import { requireAuth } from "@/lib/session";

function getErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Category name or slug already exists.";
  }

  return "Unable to save category.";
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description")
  });

  if (!parsed.success) {
    redirect(
      `/categories/new?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid data."
      )}`
    );
  }

  try {
    await db.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        createdById: user.id
      }
    });
  } catch (error) {
    redirect(`/categories/new?error=${encodeURIComponent(getErrorMessage(error))}`);
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  redirect("/categories");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAuth();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description")
  });

  if (!parsed.success) {
    redirect(
      `/categories/${id}/edit?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid data."
      )}`
    );
  }

  try {
    const existingCategory = await db.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      redirect(`/categories/${id}/edit?error=Category%20not%20found`);
    }

    await db.$transaction([
      db.category.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null
        }
      }),
      db.product.updateMany({
        where: { category: existingCategory.slug },
        data: {
          category: parsed.data.slug,
          categoryLabel: parsed.data.name
        }
      })
    ]);
  } catch (error) {
    redirect(`/categories/${id}/edit?error=${encodeURIComponent(getErrorMessage(error))}`);
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  redirect("/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/categories?error=Missing%20category%20id");
  }

  try {
    const category = await db.category.findUnique({
      where: { id }
    });

    if (!category) {
      redirect("/categories?error=Category%20not%20found");
    }

    const productCount = await db.product.count({
      where: { category: category.slug }
    });

    if (productCount > 0) {
      redirect(
        "/categories?error=Category%20cannot%20be%20deleted%20while%20products%20still%20reference%20it"
      );
    }

    await db.category.delete({
      where: { id }
    });
  } catch {
    redirect(
      "/categories?error=Category%20cannot%20be%20deleted%20while%20products%20still%20reference%20it"
    );
  }

  revalidatePath("/categories");
  redirect("/categories");
}
