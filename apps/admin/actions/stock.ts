"use server";

import { Prisma, StockMovementType } from "@eco-bright/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@eco-bright/db";
import { stockMovementSchema } from "@eco-bright/validators/stock";
import { requireAuth } from "@/lib/session";

export async function createStockMovementAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = stockMovementSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    note: formData.get("note")
  });

  if (!parsed.success) {
    redirect(
      `/stock?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid data."
      )}`
    );
  }

  try {
    await db.$transaction(async (tx) => {
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
      const previousStock = product.stockQty;
      let nextStockQty = product.stockQty;

      if (parsed.data.type === StockMovementType.IN) {
        nextStockQty = product.stockQty + requestedQty;
      } else if (parsed.data.type === StockMovementType.OUT) {
        if (product.stockQty < requestedQty) {
          throw new Error("Not enough stock for this movement.");
        }

        nextStockQty = product.stockQty - requestedQty;
      } else {
        nextStockQty = requestedQty;
      }

      if (nextStockQty < 0) {
        throw new Error("Stock cannot become negative.");
      }

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: parsed.data.type,
          quantity: parsed.data.type === StockMovementType.ADJUST
            ? Math.abs(nextStockQty - previousStock)
            : requestedQty,
          previousStock,
          newStock: nextStockQty,
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
