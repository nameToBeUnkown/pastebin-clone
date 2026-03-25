"use server";

import { auth } from "@/src/lib/auth";
import { createCommentSchema } from "@/src/schemas/comment";
import { createComment, deleteComment } from "@/src/services/comment-service";
import { revalidatePath } from "next/cache";

export async function createCommentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to comment" };
  }

  const raw = {
    content: formData.get("content"),
    pasteId: formData.get("pasteId"),
  };

  const parsed = createCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await createComment(parsed.data, session.user.id);
    revalidatePath(`/paste/${parsed.data.pasteId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to post comment" };
  }
}

export async function deleteCommentAction(commentId: string, pasteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteComment(commentId, session.user.id);
    revalidatePath(`/paste/${pasteId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
