import { z } from "zod";

export const productAttributeDraftSchema = z.object({
  name: z.string().trim().min(1, "Attribute name is required."),
  values: z
    .array(z.string().trim().min(1, "Attribute value is required."))
    .min(1, "Attribute value is required.")
});

export const productVariantAttributeSelectionSchema = z.object({
  attributeName: z.string().trim().min(1, "Attribute name is required."),
  value: z.string().trim().min(1, "Attribute value is required.")
});

export const productVariantDraftSchema = z.object({
  id: z.string().trim().optional(),
  sku: z.string().trim().max(100).optional().or(z.literal("")),
  title: z.string().trim().max(255).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Variant price must be 0 or greater."),
  oldPrice: z.coerce.number().min(0, "Variant old price must be 0 or greater.").nullable().optional(),
  currency: z.string().trim().min(3).max(10).default("USD"),
  stockQty: z.coerce.number().int().min(0, "Variant stock quantity must be 0 or greater."),
  lowStockAlert: z.coerce.number().int().min(0, "Low stock alert must be 0 or greater.").default(5),
  imageUrl: z.string().trim().url("Variant image URL must be valid.").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0, "Sort order must be 0 or greater.").nullable().optional(),
  isActive: z.boolean().default(true),
  attributeSelections: z
    .array(productVariantAttributeSelectionSchema)
    .min(1, "Each variant needs at least one attribute/value pair.")
}).superRefine((variant, ctx) => {
  if (variant.oldPrice != null && variant.oldPrice < variant.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["oldPrice"],
      message: "Variant old price must be greater than or equal to variant price."
    });
  }
});

export const productSchema = z.object({
  id: z.string().trim().min(2, "Product ID must be at least 2 characters.").max(100),
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  description: z.string().trim().min(1, "Description is required.").max(4000),
  price: z.coerce.number().positive("Price must be greater than 0."),
  oldPrice: z
    .union([z.literal(""), z.coerce.number().positive("Old price must be greater than 0.")])
    .optional(),
  currency: z.string().trim().min(3).max(10),
  stockQty: z.coerce.number().int().min(0, "Stock quantity must be 0 or greater."),
  imageUrl: z.string().trim().url("Image URL must be a valid URL.").optional().or(z.literal("")),
  imageUrls: z.string().trim().max(4000).optional().or(z.literal("")),
  badge: z.string().trim().max(100).optional().or(z.literal("")),
  tags: z.string().trim().max(500).optional().or(z.literal("")),
  useCase: z.string().trim().max(500).optional().or(z.literal("")),
  inStock: z.enum(["true", "false"]).default("true"),
  isActive: z.enum(["true", "false"]).default("true"),
  packQty: z
    .union([z.literal(""), z.coerce.number().int().positive("Pack qty must be greater than 0.")])
    .optional(),
  holeSize: z.string().trim().max(100).optional().or(z.literal("")),
  sortOrder: z
    .union([z.literal(""), z.coerce.number().int("Sort order must be a whole number.")])
    .optional(),
  needsReview: z.enum(["true", "false"]).default("false"),
  reviewFlags: z.string().trim().max(500).optional().or(z.literal("")),
  rawCategory: z.string().trim().max(200).optional().or(z.literal("")),
  titleKm: z.string().trim().max(500).optional().or(z.literal("")),
  categoryLabelKm: z.string().trim().max(500).optional().or(z.literal("")),
  useCaseKm: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionKm: z.string().trim().max(4000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required."),
  attributesPayload: z.string().optional().or(z.literal("")),
  variantsPayload: z.string().optional().or(z.literal(""))
}).superRefine((product, ctx) => {
  if (
    product.oldPrice !== undefined &&
    product.oldPrice !== "" &&
    product.oldPrice < product.price
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["oldPrice"],
      message: "Old price must be greater than or equal to price."
    });
  }
});
