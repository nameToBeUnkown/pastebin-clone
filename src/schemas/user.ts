import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be at most 50 characters"),
    bio: z
      .string()
      .max(200, "Bio must be at most 200 characters")
      .optional()
      .nullable()
      .transform((val) => val || ""),
    image: z
      .string()
      .or(z.literal(""))
      .optional()
      .nullable()
      .transform((val) => val || ""),
  })
  .strict();

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
