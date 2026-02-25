import { describe, it, expect } from "vitest";
import type {
  AuthUser,
  SessionUser,
  RegisterInput,
  LoginInput,
} from "@/src/types/auth";

describe("Auth type interfaces", () => {
  it("AuthUser has correct shape", () => {
    const user: AuthUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
    };
    expect(user.id).toBe("user-123");
    expect(user.email).toBe("user@example.com");
    expect(user.name).toBe("Test User");
  });

  it("SessionUser has correct shape", () => {
    const session: SessionUser = {
      id: "user-456",
      email: "session@example.com",
      name: "Session User",
    };
    expect(session.id).toBe("user-456");
    expect(session.email).toBe("session@example.com");
  });

  it("RegisterInput has correct shape", () => {
    const input: RegisterInput = {
      name: "New User",
      email: "new@example.com",
      password: "securepassword",
    };
    expect(input.name).toBe("New User");
    expect(input.email).toBe("new@example.com");
    expect(input.password).toBe("securepassword");
  });

  it("LoginInput has correct shape", () => {
    const input: LoginInput = {
      email: "login@example.com",
      password: "password123",
    };
    expect(input.email).toBe("login@example.com");
    expect(input.password).toBe("password123");
  });

  it("AuthUser and SessionUser have the same fields", () => {
    const auth: AuthUser = { id: "1", email: "a@b.com", name: "A" };
    const session: SessionUser = { id: "1", email: "a@b.com", name: "A" };
    expect(auth).toEqual(session);
  });
});
