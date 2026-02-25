"use server";

import { auth } from "@/src/lib/auth";
import { createPasteSchema } from "@/src/schemas/paste";
import {
  createPaste,
  deletePaste,
  togglePasteVisibility,
} from "@/src/services/paste-service";

export interface PasteActionResult {
  success: boolean;
  error?: string;
  pasteId?: string;
}

export async function createPasteAction(
  formData: FormData,
): Promise<PasteActionResult> {
  const raw = {
    title: formData.get("title"),
    content: formData.get("content"),
    language: formData.get("language"),
    expiration: formData.get("expiration"),
  };

  const parsed = createPasteSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const session = await auth();
    const authorId = session?.user?.id;

    const paste = await createPaste(parsed.data, authorId);

    return { success: true, pasteId: paste.id };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create paste" };
  }
}

export async function deletePasteAction(
  pasteId: string,
): Promise<PasteActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in" };
    }

    await deletePaste(pasteId, session.user.id);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete paste" };
  }
}

export async function toggleVisibilityAction(
  pasteId: string,
): Promise<PasteActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in" };
    }

    await togglePasteVisibility(pasteId, session.user.id);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle visibility" };
  }
}
