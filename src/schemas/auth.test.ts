import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/src/schemas/auth";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects password longer than 100 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("accepts password of exactly 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("accepts password of exactly 100 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(100),
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra unknown fields in strict mode", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      extraField: "should not be here",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "a".repeat(51),
    });

    expect(result.success).toBe(false);
  });

  it("accepts name of exactly 50 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "a".repeat(50),
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "password123",
      confirmPassword: "different456",
    });

    expect(result.success).toBe(false);
  });

  it("rejects extra unknown fields in strict mode", () => {
    const result = registerSchema.safeParse({
      ...validData,
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing confirmPassword", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("provides readable error message for mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "mismatch123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Passwords do not match");
    }
  });
});
