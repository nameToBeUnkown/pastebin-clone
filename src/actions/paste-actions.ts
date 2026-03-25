"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/src/lib/auth";
import { createPasteSchema } from "@/src/schemas/paste";
import {
  createPaste,
  deletePaste,
  getPasteById,
  togglePasteVisibility,
  verifyPastePassword,
  updatePaste,
} from "@/src/services/paste-service";

export interface PasteActionResult {
  success: boolean;
  error?: string;
  pasteId?: string;
}

export async function verifyPastePasswordAction(
  pasteId: string,
  password: string,
): Promise<PasteActionResult> {
  try {
    const isCorrect = await verifyPastePassword(pasteId, password);

    if (!isCorrect) {
      return { success: false, error: "Incorrect password" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Authentication failed" };
  }
}

export async function createPasteAction(
  formData: FormData,
): Promise<PasteActionResult> {
  const raw = {
    title: formData.get("title"),
    content: formData.get("content"),
    language: formData.get("language"),
    expiration: formData.get("expiration"),
    isPublic: formData.get("isPublic") ?? "true",
    password: (formData.get("password") as string | null) ?? undefined,
    viewLimit: (formData.get("viewLimit") as string | null) ?? undefined,
    isEncrypted: formData.get("isEncrypted") === "true",
  };

  const parsed = createPasteSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
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

export async function getPasteContentAction(
  pasteId: string,
  password?: string,
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const paste = await getPasteById(pasteId);

    if (!paste) {
      return { success: false, error: "Paste not found" };
    }

    if (paste.passwordHash) {
      if (!password) {
        return { success: false, error: "Password required" };
      }

      const isCorrect = await verifyPastePassword(pasteId, password);
      if (!isCorrect) {
        return { success: false, error: "Incorrect password" };
      }
    }

    return { success: true, content: paste.content };
  } catch {
    return { success: false, error: "Failed to fetch content" };
  }
}

export async function updatePasteAction(
  pasteId: string,
  data: {
    newPassword?: string;
    newContent?: string;
  },
): Promise<PasteActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in" };
  }

  try {
    const paste = await getPasteById(pasteId);
    if (!paste) return { success: false, error: "Paste not found" };

    if (paste.authorId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updates: any = {};

    if (data.newPassword !== undefined) {
      updates.passwordHash = data.newPassword
        ? await bcrypt.hash(data.newPassword, 10)
        : null;
    }

    if (data.newContent !== undefined) {
      updates.content = data.newContent;
    }

    await updatePaste(pasteId, updates);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update paste" };
  }
}



