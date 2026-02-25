import { describe, it, expect } from "vitest";
import { createPasteSchema } from "@/src/schemas/paste";

describe("createPasteSchema", () => {
  const validPaste = {
    title: "My Paste",
    content: "console.log('hello');",
    language: "javascript" as const,
    expiration: "never" as const,
  };

  it("accepts valid paste data", () => {
    const result = createPasteSchema.safeParse(validPaste);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 100 characters", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title of exactly 100 characters", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      title: "a".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 500000 characters", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      content: "x".repeat(500_001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported language", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      language: "brainfuck",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all supported languages", () => {
    const languages = [
      "plaintext",
      "javascript",
      "typescript",
      "python",
      "java",
      "csharp",
      "cpp",
      "c",
      "go",
      "rust",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "html",
      "css",
      "sql",
      "bash",
      "json",
      "xml",
      "yaml",
      "markdown",
      "dockerfile",
    ];

    for (const language of languages) {
      const result = createPasteSchema.safeParse({
        ...validPaste,
        language,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects unsupported expiration", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      expiration: "1y",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid expirations", () => {
    const expirations = ["never", "10m", "1h", "1d", "7d", "30d"];

    for (const expiration of expirations) {
      const result = createPasteSchema.safeParse({
        ...validPaste,
        expiration,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects extra unknown fields in strict mode", () => {
    const result = createPasteSchema.safeParse({
      ...validPaste,
      isPublic: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...noTitle } = validPaste;
    const result = createPasteSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const { content: _, ...noContent } = validPaste;
    const result = createPasteSchema.safeParse(noContent);
    expect(result.success).toBe(false);
  });

  it("rejects missing language", () => {
    const { language: _, ...noLang } = validPaste;
    const result = createPasteSchema.safeParse(noLang);
    expect(result.success).toBe(false);
  });

  it("rejects missing expiration", () => {
    const { expiration: _, ...noExp } = validPaste;
    const result = createPasteSchema.safeParse(noExp);
    expect(result.success).toBe(false);
  });

  it("strips parsed data correctly on success", () => {
    const result = createPasteSchema.safeParse(validPaste);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPaste);
    }
  });
});
