import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/src/__tests__/mocks/prisma";

// Must import service AFTER mock is set up
import {
  createPaste,
  getPasteById,
  incrementPasteViews,
  getRecentPublicPastes,
  getUserPastes,
  deletePaste,
  togglePasteVisibility,
  searchPastes,
} from "@/src/services/paste-service";

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "abc1234567"),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
});

const NOW = new Date("2024-01-15T12:00:00Z");

const MOCK_PASTE = {
  id: "abc1234567",
  title: "Test Paste",
  content: "console.log('hello');",
  language: "javascript",
  isPublic: true,
  views: 0,
  expiresAt: null,
  createdAt: NOW,
  authorId: null,
};

const MOCK_PASTE_WITH_AUTHOR = {
  ...MOCK_PASTE,
  author: null,
};

describe("createPaste", () => {
  it("creates a paste without expiration", async () => {
    prismaMock.paste.create.mockResolvedValue(MOCK_PASTE);

    const result = await createPaste({
      title: "Test Paste",
      content: "console.log('hello');",
      language: "javascript",
      expiration: "never",
    });

    expect(prismaMock.paste.create).toHaveBeenCalledWith({
      data: {
        id: "abc1234567",
        title: "Test Paste",
        content: "console.log('hello');",
        language: "javascript",
        isPublic: true,
        expiresAt: null,
        authorId: null,
      },
    });
    expect(result).toEqual(MOCK_PASTE);
  });

  it("creates a paste with expiration", async () => {
    prismaMock.paste.create.mockResolvedValue({
      ...MOCK_PASTE,
      expiresAt: new Date(NOW.getTime() + 10 * 60 * 1000),
    });

    await createPaste({
      title: "Test Paste",
      content: "content",
      language: "javascript",
      expiration: "10m",
    });

    const callArg = prismaMock.paste.create.mock.calls[0][0];
    expect(callArg.data.expiresAt).toEqual(
      new Date(NOW.getTime() + 10 * 60 * 1000),
    );
  });

  it("creates a paste with author", async () => {
    prismaMock.paste.create.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "user-123",
    });

    await createPaste(
      {
        title: "Test Paste",
        content: "content",
        language: "javascript",
        expiration: "never",
      },
      "user-123",
    );

    const callArg = prismaMock.paste.create.mock.calls[0][0];
    expect(callArg.data.authorId).toBe("user-123");
  });

  it("creates with 1h expiration", async () => {
    prismaMock.paste.create.mockResolvedValue(MOCK_PASTE);

    await createPaste({
      title: "T",
      content: "C",
      language: "python",
      expiration: "1h",
    });

    const callArg = prismaMock.paste.create.mock.calls[0][0];
    expect(callArg.data.expiresAt).toEqual(
      new Date(NOW.getTime() + 60 * 60 * 1000),
    );
  });

  it("creates with 1d expiration", async () => {
    prismaMock.paste.create.mockResolvedValue(MOCK_PASTE);

    await createPaste({
      title: "T",
      content: "C",
      language: "python",
      expiration: "1d",
    });

    const callArg = prismaMock.paste.create.mock.calls[0][0];
    expect(callArg.data.expiresAt).toEqual(
      new Date(NOW.getTime() + 24 * 60 * 60 * 1000),
    );
  });
});

describe("getPasteById", () => {
  it("returns paste when found and not expired", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(MOCK_PASTE_WITH_AUTHOR);

    const result = await getPasteById("abc1234567");

    expect(result).toEqual(MOCK_PASTE_WITH_AUTHOR);
    expect(prismaMock.paste.findUnique).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      include: { author: { select: { id: true, name: true } } },
    });
  });

  it("returns null when paste not found", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(null);

    const result = await getPasteById("nonexistent");

    expect(result).toBeNull();
  });

  it("deletes and returns null for expired paste", async () => {
    const expiredPaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      expiresAt: new Date("2024-01-14T12:00:00Z"), // Yesterday
    };
    prismaMock.paste.findUnique.mockResolvedValue(expiredPaste);
    prismaMock.paste.delete.mockResolvedValue(expiredPaste);

    const result = await getPasteById("abc1234567");

    expect(result).toBeNull();
    expect(prismaMock.paste.delete).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
    });
  });

  it("returns paste with future expiration", async () => {
    const futurePaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      expiresAt: new Date("2024-01-16T12:00:00Z"), // Tomorrow
    };
    prismaMock.paste.findUnique.mockResolvedValue(futurePaste);

    const result = await getPasteById("abc1234567");

    expect(result).toEqual(futurePaste);
    expect(prismaMock.paste.delete).not.toHaveBeenCalled();
  });
});

describe("incrementPasteViews", () => {
  it("increments views by 1", async () => {
    prismaMock.paste.update.mockResolvedValue({
      ...MOCK_PASTE,
      views: 1,
    });

    await incrementPasteViews("abc1234567");

    expect(prismaMock.paste.update).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      data: { views: { increment: 1 } },
    });
  });
});

describe("getRecentPublicPastes", () => {
  it("returns paginated public pastes (page 1)", async () => {
    prismaMock.paste.findMany.mockResolvedValue([MOCK_PASTE_WITH_AUTHOR]);
    prismaMock.paste.count.mockResolvedValue(1);

    const result = await getRecentPublicPastes(1);

    expect(result).toEqual({
      pastes: [MOCK_PASTE_WITH_AUTHOR],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });
  });

  it("uses default page 1 when no argument", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(0);

    const result = await getRecentPublicPastes();

    expect(result.currentPage).toBe(1);
  });

  it("calculates correct totalPages", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(45);

    const result = await getRecentPublicPastes(1);

    expect(result.totalPages).toBe(3); // Math.ceil(45/20)
  });

  it("passes correct skip for page 2", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(0);

    await getRecentPublicPastes(2);

    const findManyArgs = prismaMock.paste.findMany.mock.calls[0][0];
    expect(findManyArgs.skip).toBe(20);
  });
});

describe("getUserPastes", () => {
  it("returns pastes for a specific user", async () => {
    const userPaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      authorId: "user-123",
      author: { id: "user-123", name: "John" },
    };
    prismaMock.paste.findMany.mockResolvedValue([userPaste]);

    const result = await getUserPastes("user-123");

    expect(result).toEqual([userPaste]);
    expect(prismaMock.paste.findMany).toHaveBeenCalledWith({
      where: { authorId: "user-123" },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
  });

  it("returns empty array when user has no pastes", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);

    const result = await getUserPastes("user-123");

    expect(result).toEqual([]);
  });
});

describe("deletePaste", () => {
  it("deletes paste owned by user", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "user-123",
    });
    prismaMock.paste.delete.mockResolvedValue(MOCK_PASTE);

    await deletePaste("abc1234567", "user-123");

    expect(prismaMock.paste.delete).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
    });
  });

  it("throws error when paste not found", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(null);

    await expect(deletePaste("nonexistent", "user-123")).rejects.toThrow(
      "Paste not found",
    );
  });

  it("throws error when user is not the owner", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "other-user",
    });

    await expect(deletePaste("abc1234567", "user-123")).rejects.toThrow(
      "Unauthorized: you can only delete your own pastes",
    );
  });
});

describe("togglePasteVisibility", () => {
  it("toggles public paste to private", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "user-123",
      isPublic: true,
    });
    prismaMock.paste.update.mockResolvedValue({
      ...MOCK_PASTE,
      isPublic: false,
    });

    const result = await togglePasteVisibility("abc1234567", "user-123");

    expect(prismaMock.paste.update).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      data: { isPublic: false },
    });
    expect(result.isPublic).toBe(false);
  });

  it("toggles private paste to public", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "user-123",
      isPublic: false,
    });
    prismaMock.paste.update.mockResolvedValue({
      ...MOCK_PASTE,
      isPublic: true,
    });

    const result = await togglePasteVisibility("abc1234567", "user-123");

    expect(prismaMock.paste.update).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      data: { isPublic: true },
    });
    expect(result.isPublic).toBe(true);
  });

  it("throws error when paste not found", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(null);

    await expect(
      togglePasteVisibility("nonexistent", "user-123"),
    ).rejects.toThrow("Paste not found");
  });

  it("throws error when user is not the owner", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "other-user",
    });

    await expect(
      togglePasteVisibility("abc1234567", "user-123"),
    ).rejects.toThrow("Unauthorized");
  });
});

describe("searchPastes", () => {
  it("returns paginated search results", async () => {
    prismaMock.paste.findMany.mockResolvedValue([MOCK_PASTE_WITH_AUTHOR]);
    prismaMock.paste.count.mockResolvedValue(1);

    const result = await searchPastes("hello", 1);

    expect(result).toEqual({
      pastes: [MOCK_PASTE_WITH_AUTHOR],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });
  });

  it("uses default page 1", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(0);

    const result = await searchPastes("test");

    expect(result.currentPage).toBe(1);
  });

  it("returns empty results when no matches", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(0);

    const result = await searchPastes("nonexistent-query");

    expect(result.pastes).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
