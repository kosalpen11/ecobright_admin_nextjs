import { z } from "zod";

export const productSchema = z.object({
  id: z
    .string()
    .trim()
    .min(2, "Product ID must be at least 2 characters.")
    .max(100, "Product ID must be at most 100 characters."),
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  description: z.string().trim().min(1, "Description is required.").max(4000),
  price: z.coerce.number().positive("Price must be greater than 0."),
  oldPrice: z
    .union([z.literal(""), z.coerce.number().positive("Old price must be greater than 0.")])
    .optional(),
  currency: z.string().trim().min(3, "Currency is required.").max(10, "Currency is too long."),
  imageUrl: z.string().trim().url("Image URL must be a valid URL.").optional().or(z.literal("")),
  imageUrls: z.string().trim().max(4000, "Image URLs are too long.").optional().or(z.literal("")),
  badge: z.string().trim().max(100, "Badge is too long.").optional().or(z.literal("")),
  tags: z.string().trim().max(500, "Tags are too long.").optional().or(z.literal("")),
  useCase: z.string().trim().max(500, "Use case is too long.").optional().or(z.literal("")),
  inStock: z.enum(["true", "false"]).default("true"),
  isActive: z.enum(["true", "false"]).default("true"),
  packQty: z
    .union([z.literal(""), z.coerce.number().int().positive("Pack qty must be greater than 0.")])
    .optional(),
  holeSize: z.string().trim().max(100, "Hole size is too long.").optional().or(z.literal("")),
  sortOrder: z
    .union([z.literal(""), z.coerce.number().int("Sort order must be a whole number.")])
    .optional(),
  needsReview: z.enum(["true", "false"]).default("false"),
  reviewFlags: z.string().trim().max(500, "Review flags are too long.").optional().or(z.literal("")),
  rawCategory: z.string().trim().max(200, "Raw category is too long.").optional().or(z.literal("")),
  titleKm: z.string().trim().max(500, "Khmer title is too long.").optional().or(z.literal("")),
  categoryLabelKm: z
    .string()
    .trim()
    .max(500, "Khmer category label is too long.")
    .optional()
    .or(z.literal("")),
  useCaseKm: z.string().trim().max(500, "Khmer use case is too long.").optional().or(z.literal("")),
  descriptionKm: z
    .string()
    .trim()
    .max(4000, "Khmer description is too long.")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Category is required.")
});
