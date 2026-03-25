import { describe, it, expect } from "vitest";
import { cn, bufferToBase64, base64ToBuffer } from "@/src/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("merges tailwind classes correctly (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("bufferToBase64", () => {
  it("converts Uint8Array to base64", () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    expect(bufferToBase64(data)).toBe("SGVsbG8=");
  });

  it("handles large buffers with chunks", () => {
    const size = 16384 + 100;
    const large = new Uint8Array(size).fill(65); // "AAA..."
    const b64 = bufferToBase64(large);
    expect(b64.length).toBeGreaterThan(size);
  });
});

describe("base64ToBuffer", () => {
  it("converts base64 to Uint8Array", () => {
    const b64 = "SGVsbG8=";
    const buffer = base64ToBuffer(b64);
    expect(buffer[0]).toBe(72); // 'H'
    expect(buffer.length).toBe(5);
  });
});
