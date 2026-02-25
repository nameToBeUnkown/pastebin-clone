import { describe, it, expect } from "vitest";
import {
  PASTE_EXPIRATION_LABELS,
  EXPIRATION_MS,
  SUPPORTED_LANGUAGES,
} from "@/src/types/paste";
import type {
  Paste,
  PasteWithAuthor,
  PaginatedPastes,
  CreatePasteInput,
  PasteExpiration,
  SupportedLanguage,
} from "@/src/types/paste";

describe("PASTE_EXPIRATION_LABELS", () => {
  it("has all expiration options", () => {
    const keys = Object.keys(PASTE_EXPIRATION_LABELS);
    expect(keys).toContain("never");
    expect(keys).toContain("10m");
    expect(keys).toContain("1h");
    expect(keys).toContain("1d");
    expect(keys).toContain("7d");
    expect(keys).toContain("30d");
    expect(keys).toHaveLength(6);
  });

  it("has human-readable labels", () => {
    expect(PASTE_EXPIRATION_LABELS.never).toBe("Never");
    expect(PASTE_EXPIRATION_LABELS["10m"]).toBe("10 Minutes");
    expect(PASTE_EXPIRATION_LABELS["1h"]).toBe("1 Hour");
    expect(PASTE_EXPIRATION_LABELS["1d"]).toBe("1 Day");
    expect(PASTE_EXPIRATION_LABELS["7d"]).toBe("7 Days");
    expect(PASTE_EXPIRATION_LABELS["30d"]).toBe("30 Days");
  });
});

describe("EXPIRATION_MS", () => {
  it("has null for never", () => {
    expect(EXPIRATION_MS.never).toBeNull();
  });

  it("has correct millisecond values", () => {
    expect(EXPIRATION_MS["10m"]).toBe(10 * 60 * 1000);
    expect(EXPIRATION_MS["1h"]).toBe(60 * 60 * 1000);
    expect(EXPIRATION_MS["1d"]).toBe(24 * 60 * 60 * 1000);
    expect(EXPIRATION_MS["7d"]).toBe(7 * 24 * 60 * 60 * 1000);
    expect(EXPIRATION_MS["30d"]).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("has all 6 expiration options", () => {
    expect(Object.keys(EXPIRATION_MS)).toHaveLength(6);
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  it("includes common languages", () => {
    expect(SUPPORTED_LANGUAGES).toContain("javascript");
    expect(SUPPORTED_LANGUAGES).toContain("typescript");
    expect(SUPPORTED_LANGUAGES).toContain("python");
    expect(SUPPORTED_LANGUAGES).toContain("html");
    expect(SUPPORTED_LANGUAGES).toContain("css");
    expect(SUPPORTED_LANGUAGES).toContain("json");
  });

  it("includes plaintext as default", () => {
    expect(SUPPORTED_LANGUAGES).toContain("plaintext");
  });

  it("has 23 languages total", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(23);
  });

  it("does not have duplicates", () => {
    const unique = new Set(SUPPORTED_LANGUAGES);
    expect(unique.size).toBe(SUPPORTED_LANGUAGES.length);
  });
});

describe("Type interfaces compile-time checks", () => {
  it("Paste interface has correct shape", () => {
    const paste: Paste = {
      id: "test-id",
      title: "Test",
      content: "content",
      language: "javascript",
      isPublic: true,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: null,
    };
    expect(paste.id).toBe("test-id");
    expect(paste.authorId).toBeNull();
  });

  it("PasteWithAuthor extends Paste with author field", () => {
    const paste: PasteWithAuthor = {
      id: "test-id",
      title: "Test",
      content: "content",
      language: "javascript",
      isPublic: true,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: "user-1",
      author: { id: "user-1", name: "John" },
    };
    expect(paste.author?.name).toBe("John");
  });

  it("PasteWithAuthor can have null author", () => {
    const paste: PasteWithAuthor = {
      id: "test-id",
      title: "Test",
      content: "content",
      language: "javascript",
      isPublic: true,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: null,
      author: null,
    };
    expect(paste.author).toBeNull();
  });

  it("PaginatedPastes structure is correct", () => {
    const paginated: PaginatedPastes = {
      pastes: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
    expect(paginated.total).toBe(0);
    expect(paginated.pastes).toEqual([]);
  });

  it("CreatePasteInput has required fields", () => {
    const input: CreatePasteInput = {
      title: "Title",
      content: "Content",
      language: "python",
      expiration: "1h",
    };
    expect(input.language).toBe("python");
  });

  it("PasteExpiration type covers all options", () => {
    const expirations: PasteExpiration[] = [
      "never",
      "10m",
      "1h",
      "1d",
      "7d",
      "30d",
    ];
    expect(expirations).toHaveLength(6);
  });

  it("SupportedLanguage type matches SUPPORTED_LANGUAGES values", () => {
    const lang: SupportedLanguage = "typescript";
    expect(SUPPORTED_LANGUAGES).toContain(lang);
  });
});
