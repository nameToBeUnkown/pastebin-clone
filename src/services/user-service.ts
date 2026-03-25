import { prisma } from "@/src/lib/prisma";
import { hash } from "bcryptjs";
import type { RegisterInput } from "@/src/types/auth";
import type { UserProfile, UserStats } from "@/src/types/user";

const SALT_ROUNDS = 12;

export async function createUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      hashedPassword,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          pastes: true,
          comments: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error("User not found");
  }

  return profile;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const pastes = await prisma.paste.findMany({
    where: { authorId: userId },
    select: { views: true },
  });

  const totalViews = pastes.reduce((sum, p) => sum + p.views, 0);

  return { totalViews };
}

export async function getPastesByAuthorId(userId: string, isOwner = false) {
  return await prisma.paste.findMany({
    where: {
      authorId: userId,
      ...(isOwner ? {} : { isPublic: true }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}
