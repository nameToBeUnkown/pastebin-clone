import { getPasteById } from "@/src/services/paste-service";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paste = await getPasteById(id);

  if (!paste) {
    notFound();
  }

  if (paste.passwordHash || paste.isEncrypted) {
    return new Response("Unauthorized - This paste is protected", {
      status: 401,
    });
  }

  return new Response(paste.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
