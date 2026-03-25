import { prisma } from "@/src/lib/prisma";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import type {
  CreatePasteInput,
  PasteWithAuthor,
  PaginatedPastes,
} from "@/src/types/paste";
import { EXPIRATION_MS } from "@/src/types/paste";

const RECENT_PASTES_LIMIT = 12;

export async function createPaste(
  input: CreatePasteInput,
  userId?: string
): Promise<string> {
  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 10)
    : null;

  const expiresAt =
    input.expiration !== "never"
      ? new Date(Date.now() + (EXPIRATION_MS[input.expiration] ?? 0))
      : null;

  const paste = await prisma.paste.create({
    data: {
      id: nanoid(10),
      title: input.title,
      content: input.content,
      language: input.language,
      isPublic: input.isPublic,
      viewLimit: input.viewLimit,
      isEncrypted: input.isEncrypted ?? false,
      passwordHash,
      expiresAt,
      authorId: userId,
    },
  });

  return paste.id;
}

export async function getPasteById(id: string): Promise<PasteWithAuthor | null> {
  const paste = await prisma.paste.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  if (!paste) return null;

  // Check expiration
  if (paste.expiresAt && paste.expiresAt < new Date()) {
    return null;
  }

  // Check view limit
  if (paste.viewLimit && paste.views >= paste.viewLimit) {
    return null;
  }

  return paste as unknown as PasteWithAuthor;
}

export async function incrementPasteViews(id: string) {
  await prisma.paste.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getRecentPublicPastes(
  page: number = 1
): Promise<PaginatedPastes> {
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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.paste.count({
      where: {
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
  ]);

  return {
    pastes: pastes as unknown as PasteWithAuthor[],
    total,
    totalPages: Math.ceil(total / RECENT_PASTES_LIMIT),
    currentPage: page,
  };
}

export async function searchPastes(
  query: string,
  page: number = 1
): Promise<PaginatedPastes> {
  const skip = (page - 1) * RECENT_PASTES_LIMIT;

  const [pastes, total] = await Promise.all([
    prisma.paste.findMany({
      where: {
        isPublic: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          { OR: [{ title: { contains: query } }, { content: { contains: query } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_PASTES_LIMIT,
      skip,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.paste.count({
      where: {
        isPublic: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          { OR: [{ title: { contains: query } }, { content: { contains: query } }] },
        ],
      },
    }),
  ]);

  return {
    pastes: pastes as unknown as PasteWithAuthor[],
    total,
    totalPages: Math.ceil(total / RECENT_PASTES_LIMIT),
    currentPage: page,
  };
}

export async function getUserPastes(
  userId: string
): Promise<PasteWithAuthor[]> {
  const pastes = await prisma.paste.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return pastes as unknown as PasteWithAuthor[];
}

export async function verifyPastePassword(
  id: string,
  password?: string
): Promise<boolean> {
  if (!password) return false;

  const paste = await prisma.paste.findUnique({
    where: { id },
    select: { passwordHash: true },
  });

  if (!paste?.passwordHash) return true;

  return await bcrypt.compare(password, paste.passwordHash);
}

export async function deletePaste(id: string, userId: string) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (paste.authorId !== userId) {
    throw new Error("Unauthorized: you can only delete your own pastes");
  }

  await prisma.comment.deleteMany({ where: { pasteId: id } });
  await prisma.paste.delete({ where: { id } });
}

export async function togglePasteVisibility(id: string, userId: string) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (paste.authorId !== userId) {
    throw new Error("Unauthorized: you can only edit your own pastes");
  }

  await prisma.paste.update({
    where: { id },
    data: { isPublic: !paste.isPublic },
  });
}

export async function updatePaste(
  id: string,
  userId: string,
  data: Partial<import("@/src/types/paste").Paste>
) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (paste.authorId !== userId) {
    throw new Error("Unauthorized: you can only edit your own pastes");
  }

  return await prisma.paste.update({
    where: { id },
    data: {
      ...data,
      passwordHash:
        data.passwordHash === undefined ? undefined : data.passwordHash,
    },
  });
}
