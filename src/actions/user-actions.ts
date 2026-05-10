"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { updateUserProfile } from "@/src/services/user-service";
import { updateProfileSchema } from "@/src/schemas/user";

export async function updateProfileAction(formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    let imageBase64 = undefined;
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const mimeType = imageFile.type || "image/jpeg";
      imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    const rawData = {
      name: formData.get("name"),
      bio: formData.get("bio"),
      image: imageBase64, // pass the base64 string or undefined
    };

    const validatedData = updateProfileSchema.parse(rawData);

    const updateData: {
      name: string;
      bio?: string | null;
      image?: string | null;
    } = {
      name: validatedData.name,
      bio: validatedData.bio || null,
    };

    if (validatedData.image) {
      updateData.image = validatedData.image;
    }

    await updateUserProfile(userId, updateData);

    revalidatePath("/dashboard/settings");
    revalidatePath("/user/[id]", "page");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
