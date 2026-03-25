import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  paste: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  comment: {
    deleteMany: vi.fn(),
  },
};

vi.mock("@/src/lib/prisma", () => ({
  prisma: prismaMock,
}));
