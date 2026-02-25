import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/src/__tests__/mocks/prisma";
import { createUser, getUserById } from "@/src/services/user-service";

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password_123"),
}));

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
    prismaMock.user.create.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      hashedPassword: "hashed_password_123",
      createdAt: new Date(),
    });

    const result = await createUser(validInput);

    expect(result).toEqual({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
    });
  });

  it("throws error if email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "john@example.com",
      name: "Existing",
      hashedPassword: "xxx",
      createdAt: new Date(),
    });

    await expect(createUser(validInput)).rejects.toThrow(
      "User with this email already exists",
    );
  });

  it("calls findUnique with correct email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      hashedPassword: "hashed",
      createdAt: new Date(),
    });

    await createUser(validInput);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });
  });

  it("hashes the password before saving", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      hashedPassword: "hashed_password_123",
      createdAt: new Date(),
    });

    await createUser(validInput);

    const createArg = prismaMock.user.create.mock.calls[0][0];
    expect(createArg.data.hashedPassword).toBe("hashed_password_123");
    expect(createArg.data.hashedPassword).not.toBe("password123");
  });

  it("does not return hashedPassword in the result", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      hashedPassword: "hashed_password_123",
      createdAt: new Date(),
    });

    const result = await createUser(validInput);

    expect(result).not.toHaveProperty("hashedPassword");
  });
});

describe("getUserById", () => {
  it("returns user when found", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      createdAt: new Date("2024-01-01"),
    });

    const result = await getUserById("user-123");

    expect(result).toEqual({
      id: "user-123",
      email: "john@example.com",
      name: "John Doe",
      createdAt: new Date("2024-01-01"),
    });
  });

  it("returns null when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getUserById("nonexistent");

    expect(result).toBeNull();
  });

  it("queries with correct select fields", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await getUserById("user-123");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  });
});
