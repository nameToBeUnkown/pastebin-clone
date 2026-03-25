import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  pasteId: z.string().min(1, "Paste ID is required"),
});
