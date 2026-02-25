import { prisma } from "@/src/lib/prisma";
import { hash } from "bcryptjs";
import type { RegisterInput } from "@/src/types/auth";

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
