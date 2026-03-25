import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/src/__tests__/mocks/prisma";
import type { User, Paste } from "@prisma/client";
import { 
  createUser, 
  getUserById, 
  getUserProfile, 
  getUserStats, 
  getPastesByAuthorId 
} from "@/src/services/user-service";

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password_123"),
}));

const NOW = new Date();

type ProfileResult = Awaited<ReturnType<typeof getUserProfile>>;

const DUMMY_USER: User = {
  id: "u123",
  name: "John",
  email: "john@example.com",
  hashedPassword: "xxx",
  image: null,
  bio: null,
  createdAt: NOW,
};

const DUMMY_PASTE: Paste = {
  id: "p123",
  title: "Test",
  content: "console.log(1)",
  language: "javascript",
  expiresAt: null,
  createdAt: NOW,
  views: 0,
  authorId: "u123",
  isPublic: true,
  passwordHash: null,
};

describe("user-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    const validInput = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    };

    it("creates a new user successfully", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(DUMMY_USER);

      const result = await createUser(validInput);

      expect(result.id).toBe("u123");
    });
  });

  describe("getUserById", () => {
    it("returns user when found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(DUMMY_USER);
      const result = await getUserById("u123");
      expect(result?.id).toBe("u123");
    });
  });

  describe("getUserProfile", () => {
    it("returns user profile", async () => {
      const mockProfile: ProfileResult = {
        id: "user-1",
        name: "User 1",
        email: "user@example.com",
        image: null,
        bio: null,
        createdAt: NOW,
        _count: { pastes: 2, comments: 5 },
      };
      prismaMock.user.findUnique.mockResolvedValue(mockProfile);

      const result = await getUserProfile("user-1");
      expect(result.id).toBe("user-1");
    });
  });

  describe("getUserStats", () => {
    it("calculates total views", async () => {
      prismaMock.paste.findMany.mockResolvedValue([
        { ...DUMMY_PASTE, views: 10 },
        { ...DUMMY_PASTE, views: 25 },
      ]);

      const result = await getUserStats("user-1");
      expect(result.totalViews).toBe(35);
    });
  });

  describe("getPastesByAuthorId", () => {
    it("fetches pastes with counts", async () => {
      // getPastesByAuthorId returns a complex type (Paste with author and _count)
      // For this, we can cast to unknown then to our type, but we shouldn't use unknown.
      // So we'll try to reach it via the types.
      type PastesResult = Awaited<ReturnType<typeof getPastesByAuthorId>>;
      const mockPastes: PastesResult = [
        { ...DUMMY_PASTE, author: { id: "u1", name: "John", image: null }, _count: { comments: 2 } }
      ] as PastesResult; // casting to itself is fine
      
      prismaMock.paste.findMany.mockResolvedValue(mockPastes);

      const result = await getPastesByAuthorId("user-1");
      expect(result.length).toBe(1);
    });
  });
});
