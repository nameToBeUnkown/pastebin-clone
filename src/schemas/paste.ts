import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "@/src/types/paste";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 500_000;

export const createPasteSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(
        MAX_TITLE_LENGTH,
        `Title must be at most ${MAX_TITLE_LENGTH} characters`,
      ),
    content: z
      .string()
      .min(1, "Content is required")
      .max(
        MAX_CONTENT_LENGTH,
        `Content must be at most ${MAX_CONTENT_LENGTH} characters`,
      ),
    language: z.enum(SUPPORTED_LANGUAGES, {
      errorMap: () => ({ message: "Invalid language selected" }),
    }),
    expiration: z.enum(["never", "10m", "1h", "1d", "7d", "30d"], {
      errorMap: () => ({ message: "Invalid expiration selected" }),
    }),
  })
  .strict();

export type CreatePasteSchema = z.infer<typeof createPasteSchema>;
