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
  verifyPastePassword,
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
  viewLimit: null,
  passwordHash: null,
  isEncrypted: false,
  expiresAt: null,
  createdAt: NOW,
  authorId: null,
};

const MOCK_PASTE_WITH_AUTHOR = {
  ...MOCK_PASTE,
  author: null,
  _count: {
    comments: 0
  }
};

const INCLUDE_WITH_COMMENTS = {
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
};

describe("createPaste", () => {
  it("creates a paste without expiration", async () => {
    prismaMock.paste.create.mockResolvedValue(MOCK_PASTE);

    const result = await createPaste({
      title: "Test Paste",
      content: "console.log('hello');",
      language: "javascript",
      expiration: "never",
      isPublic: true,
    });

    expect(prismaMock.paste.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        id: "abc1234567",
        title: "Test Paste",
        content: "console.log('hello');",
        language: "javascript",
        isPublic: true,
      }),
    }));
    expect(result).toEqual(MOCK_PASTE.id);
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
      isPublic: true,
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
        isPublic: true,
      },
      "user-123",
    );

    const callArg = prismaMock.paste.create.mock.calls[0][0];
    expect(callArg.data.authorId).toBe("user-123");
  });
});

describe("getPasteById", () => {
  it("returns paste when found and not expired", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(MOCK_PASTE_WITH_AUTHOR);

    const result = await getPasteById("abc1234567");

    expect(result).toEqual(MOCK_PASTE_WITH_AUTHOR);
    expect(prismaMock.paste.findUnique).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      include: INCLUDE_WITH_COMMENTS,
    });
  });

  it("returns null when paste not found", async () => {
    prismaMock.paste.findUnique.mockResolvedValue(null);

    const result = await getPasteById("nonexistent");

    expect(result).toBeNull();
  });

  it("returns null for expired paste (does not delete anymore)", async () => {
    const expiredPaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      expiresAt: new Date("2024-01-14T12:00:00Z"), // Yesterday
    };
    prismaMock.paste.findUnique.mockResolvedValue(expiredPaste);

    const result = await getPasteById("abc1234567");

    expect(result).toBeNull();
    expect(prismaMock.paste.delete).not.toHaveBeenCalled();
  });

  it("returns null when view limit is reached", async () => {
    const limitedPaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      viewLimit: 5,
      views: 5,
    };
    prismaMock.paste.findUnique.mockResolvedValue(limitedPaste);

    const result = await getPasteById("abc1234567");

    expect(result).toBeNull();
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

  it("calculates correct totalPages with limit 12", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(45);

    const result = await getRecentPublicPastes(1);

    expect(result.totalPages).toBe(4); // Math.ceil(45/12)
  });

  it("passes correct skip for page 2 with limit 12", async () => {
    prismaMock.paste.findMany.mockResolvedValue([]);
    prismaMock.paste.count.mockResolvedValue(0);

    await getRecentPublicPastes(2);

    const findManyArgs = prismaMock.paste.findMany.mock.calls[0][0];
    expect(findManyArgs.skip).toBe(12);
  });
});

describe("getUserPastes", () => {
  it("returns pastes for a specific user", async () => {
    const userPaste = {
      ...MOCK_PASTE_WITH_AUTHOR,
      authorId: "user-123",
      author: { id: "user-123", name: "John", image: null },
    };
    prismaMock.paste.findMany.mockResolvedValue([userPaste]);

    const result = await getUserPastes("user-123");

    expect(result).toEqual([userPaste]);
    expect(prismaMock.paste.findMany).toHaveBeenCalledWith({
      where: { authorId: "user-123" },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_WITH_COMMENTS,
    });
  });
});

describe("deletePaste", () => {
  it("deletes paste and its comments", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      ...MOCK_PASTE,
      authorId: "user-123",
    });
    prismaMock.paste.delete.mockResolvedValue(MOCK_PASTE as typeof MOCK_PASTE);
    prismaMock.comment.deleteMany.mockResolvedValue({ count: 0 });

    await deletePaste("abc1234567", "user-123");

    expect(prismaMock.paste.delete).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
    });
    expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({
      where: { pasteId: "abc1234567" },
    });
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

    await togglePasteVisibility("abc1234567", "user-123");

    expect(prismaMock.paste.update).toHaveBeenCalledWith({
      where: { id: "abc1234567" },
      data: { isPublic: false },
    });
  });
});

describe("searchPastes", () => {
  it("returns paginated search results with AND and OR", async () => {
    prismaMock.paste.findMany.mockResolvedValue([MOCK_PASTE_WITH_AUTHOR]);
    prismaMock.paste.count.mockResolvedValue(1);

    const result = await searchPastes("hello", 1);

    expect(result.pastes).toEqual([MOCK_PASTE_WITH_AUTHOR]);
    expect(prismaMock.paste.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        isPublic: true,
      })
    }));
  });
});

describe("verifyPastePassword", () => {
  it("returns true if no password is set", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({ passwordHash: null });

    const result = await verifyPastePassword("id", "any");

    expect(result).toBe(true);
  });

  it("returns false if password is wrong", async () => {
    prismaMock.paste.findUnique.mockResolvedValue({
      passwordHash: "wrong-hash",
    });

    const result = await verifyPastePassword("id", "secret");
    expect(result).toBe(false);
  });
});
