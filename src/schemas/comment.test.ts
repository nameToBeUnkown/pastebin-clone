import { describe, it, expect } from "vitest";
import { createCommentSchema } from "@/src/schemas/comment";

describe("createCommentSchema", () => {
  it("validates valid input", () => {
    const input = {
      content: "Nice code!",
      pasteId: "paste-123",
    };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const input = {
      content: "",
      pasteId: "paste-123",
    };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 1000 chars", () => {
    const input = {
      content: "a".repeat(1001),
      pasteId: "paste-123",
    };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
