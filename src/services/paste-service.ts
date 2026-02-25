import { prisma } from "@/src/lib/prisma";
import { nanoid } from "nanoid";
import type { CreatePasteInput } from "@/src/types/paste";
import { EXPIRATION_MS } from "@/src/types/paste";

const PASTE_ID_LENGTH = 10;
const RECENT_PASTES_LIMIT = 20;

export async function createPaste(input: CreatePasteInput, authorId?: string) {
  const expirationMs = EXPIRATION_MS[input.expiration];
  const expiresAt = expirationMs
    ? new Date(Date.now() + expirationMs)
    : null;

  const paste = await prisma.paste.create({
    data: {
      id: nanoid(PASTE_ID_LENGTH),
      title: input.title,
      content: input.content,
      language: input.language,
      isPublic: !authorId ? true : true,
      expiresAt,
      authorId: authorId ?? null,
    },
  });

  return paste;
}

export async function getPasteById(id: string) {
  const paste = await prisma.paste.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!paste) {
    return null;
  }

  if (paste.expiresAt && paste.expiresAt < new Date()) {
    await prisma.paste.delete({ where: { id } });
    return null;
  }

  return paste;
}

export async function incrementPasteViews(id: string) {
  await prisma.paste.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getRecentPublicPastes(page: number = 1) {
  const skip = (page - 1) * RECENT_PASTES_LIMIT;

  const [pastes, total] = await Promise.all([
    prisma.paste.findMany({
      where: {
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_PASTES_LIMIT,
      skip,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.paste.count({
      where: {
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
  ]);

  return {
    pastes,
    total,
    totalPages: Math.ceil(total / RECENT_PASTES_LIMIT),
    currentPage: page,
  };
}

export async function getUserPastes(userId: string) {
  const pastes = await prisma.paste.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return pastes;
}

export async function deletePaste(id: string, userId: string) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (paste.authorId !== userId) {
    throw new Error("Unauthorized: you can only delete your own pastes");
  }

  await prisma.paste.delete({ where: { id } });
}

export async function togglePasteVisibility(id: string, userId: string) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (paste.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.paste.update({
    where: { id },
    data: { isPublic: !paste.isPublic },
  });

  return updated;
}

export async function searchPastes(query: string, page: number = 1) {
  const skip = (page - 1) * RECENT_PASTES_LIMIT;

  const [pastes, total] = await Promise.all([
    prisma.paste.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_PASTES_LIMIT,
      skip,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.paste.count({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
    }),
  ]);

  return {
    pastes,
    total,
    totalPages: Math.ceil(total / RECENT_PASTES_LIMIT),
    currentPage: page,
  };
}
