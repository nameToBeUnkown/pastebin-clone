import { describe, it, expect } from "vitest";
import { cn } from "@/src/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("merges tailwind classes correctly (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles conflicting tailwind utilities", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles single class", () => {
    expect(cn("single")).toBe("single");
  });

  it("handles array of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("deduplicates exact same class", () => {
    const result = cn("mt-2", "mt-2");
    expect(result).toBe("mt-2");
  });
});
