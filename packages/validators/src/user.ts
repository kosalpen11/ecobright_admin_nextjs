import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["ADMIN", "STAFF"]),
  isActive: z.enum(["true", "false"]).default("true"),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters.")
});
