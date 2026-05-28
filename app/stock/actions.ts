"use server";

import { Prisma, StockMovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { stockMovementSchema } from "@/lib/validations/stock";

export async function createStockMovementAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = stockMovementSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    note: formData.get("note")
  });

  if (!parsed.success) {
    redirect(`/stock?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid data.")}`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
        select: {
          id: true,
          stockQty: true
        }
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      const requestedQty = parsed.data.quantity;
      let nextStockQty = product.stockQty;
      let movementQty = requestedQty;

      if (parsed.data.type === StockMovementType.IN) {
        nextStockQty = product.stockQty + requestedQty;
      } else if (parsed.data.type === StockMovementType.OUT) {
        if (product.stockQty < requestedQty) {
          throw new Error("Not enough stock for this movement.");
        }
        nextStockQty = product.stockQty - requestedQty;
      } else {
        movementQty = Math.abs(requestedQty - product.stockQty);
        nextStockQty = requestedQty;
      }

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: parsed.data.type,
          quantity: movementQty,
          note: parsed.data.note || null,
          createdById: user.id
        }
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stockQty: nextStockQty,
          inStock: nextStockQty > 0
        }
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Error
    ) {
      redirect(`/stock?error=${encodeURIComponent(error.message || "Unable to create stock movement.")}`);
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/stock");
}
