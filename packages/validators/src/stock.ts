import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  productVariantId: z.string().optional().or(z.literal("")),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
  note: z.string().trim().max(500).optional().or(z.literal(""))
});
