"use server";

import { Prisma, StockMovementType } from "@eco-bright/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@eco-bright/db";
import { stockMovementSchema } from "@eco-bright/validators/stock";
import { requireAuth } from "@/lib/session";

function getMovementQuantity(
  type: StockMovementType,
  previousStock: number,
  nextStock: number,
  requestedQty: number
) {
  return type === StockMovementType.ADJUSTMENT
    ? Math.abs(nextStock - previousStock)
    : requestedQty;
}

function calculateNextStock(
  type: StockMovementType,
  previousStock: number,
  requestedQty: number
) {
  if (type === StockMovementType.IN) {
    return previousStock + requestedQty;
  }

  if (type === StockMovementType.OUT) {
    if (previousStock < requestedQty) {
      throw new Error("Not enough stock for this movement.");
    }

    return previousStock - requestedQty;
  }

  return requestedQty;
}

export async function createStockMovementAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = stockMovementSchema.safeParse({
    productId: formData.get("productId"),
    productVariantId: formData.get("productVariantId"),
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
      const movementType = parsed.data.type as StockMovementType;
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              stockQty: true
            }
          }
        }
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      const requestedQty = parsed.data.quantity;
      const hasVariants = product.variants.length > 0;
      const variantId = parsed.data.productVariantId?.trim() || null;

      if (hasVariants && !variantId) {
        throw new Error("This product has variants. Select a variant for stock movement.");
      }

      if (!hasVariants && variantId) {
        throw new Error("Selected product does not use variants.");
      }

      if (variantId) {
        const variant = product.variants.find((item) => item.id === variantId);

        if (!variant) {
          throw new Error("Variant not found for this product.");
        }

        const previousStock = variant.stockQty;
        const nextStock = calculateNextStock(movementType, previousStock, requestedQty);

        if (nextStock < 0) {
          throw new Error("Stock cannot become negative.");
        }

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            productVariantId: variant.id,
            type: movementType,
            quantity: getMovementQuantity(
              movementType,
              previousStock,
              nextStock,
              requestedQty
            ),
            previousStock,
            newStock: nextStock,
            note: parsed.data.note || null,
            createdById: user.id
          }
        });

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQty: nextStock
          }
        });

        const aggregate = await tx.productVariant.aggregate({
          where: { productId: product.id },
          _sum: {
            stockQty: true
          }
        });

        const totalStock = aggregate._sum.stockQty ?? 0;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQty: totalStock,
            inStock: totalStock > 0
          }
        });

        return;
      }

      const previousStock = product.stockQty;
      const nextStock = calculateNextStock(movementType, previousStock, requestedQty);

      if (nextStock < 0) {
        throw new Error("Stock cannot become negative.");
      }

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: movementType,
          quantity: getMovementQuantity(
            movementType,
            previousStock,
            nextStock,
            requestedQty
          ),
          previousStock,
          newStock: nextStock,
          note: parsed.data.note || null,
          createdById: user.id
        }
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stockQty: nextStock,
          inStock: nextStock > 0
        }
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Error
    ) {
      redirect(
        `/stock?error=${encodeURIComponent(
          error.message || "Unable to create stock movement."
        )}`
      );
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
  redirect("/stock");
}
