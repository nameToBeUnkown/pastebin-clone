import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock AuthError class using vi.hoisted so it's available for vi.mock
const { MockAuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.name = "AuthError";
      this.type = type;
    }
  }
  return { MockAuthError };
});

// Mock next-auth to export our MockAuthError
vi.mock("next-auth", () => ({
  AuthError: MockAuthError,
}));

// Mock next-auth
vi.mock("@/src/lib/auth", () => ({
  signIn: vi.fn(),
}));

// Mock user service
vi.mock("@/src/services/user-service", () => ({
  createUser: vi.fn(),
}));

// Must import after mocks
import { loginAction, registerAction } from "@/src/actions/auth-actions";
import { signIn } from "@/src/lib/auth";
import { createUser } from "@/src/services/user-service";

const mockSignIn = vi.mocked(signIn);
const mockCreateUser = vi.mocked(createUser);

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loginAction", () => {
  it("returns success on valid login", async () => {
    mockSignIn.mockResolvedValue(undefined);

    const fd = createFormData({
      email: "user@example.com",
      password: "password123",
    });

    const result = await loginAction(fd);
    expect(result.success).toBe(true);
  });

  it("returns error for invalid email format", async () => {
    const fd = createFormData({
      email: "not-an-email",
      password: "password123",
    });

    const result = await loginAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error for short password", async () => {
    const fd = createFormData({
      email: "user@example.com",
      password: "short",
    });

    const result = await loginAction(fd);
    expect(result.success).toBe(false);
  });

  it("returns error message on AuthError", async () => {
    mockSignIn.mockRejectedValue(new MockAuthError("CredentialsSignin"));

    const fd = createFormData({
      email: "user@example.com",
      password: "password123",
    });

    const result = await loginAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email or password");
  });

  it("rethrows non-AuthError errors", async () => {
    mockSignIn.mockRejectedValue(new TypeError("Network failure"));

    const fd = createFormData({
      email: "user@example.com",
      password: "password123",
    });

    await expect(loginAction(fd)).rejects.toThrow("Network failure");
  });

  it("calls signIn with correct credentials", async () => {
    mockSignIn.mockResolvedValue(undefined);

    const fd = createFormData({
      email: "test@example.com",
      password: "mypassword1",
    });

    await loginAction(fd);

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "mypassword1",
      redirect: false,
    });
  });
});

describe("registerAction", () => {
  it("returns success on valid registration", async () => {
    mockCreateUser.mockResolvedValue({
      id: "new-user",
      email: "new@example.com",
      name: "New User",
    });
    mockSignIn.mockResolvedValue(undefined);

    const fd = createFormData({
      name: "New User",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const result = await registerAction(fd);
    expect(result.success).toBe(true);
  });

  it("returns error for missing name", async () => {
    const fd = createFormData({
      name: "",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const result = await registerAction(fd);
    expect(result.success).toBe(false);
  });

  it("returns error for password mismatch", async () => {
    const fd = createFormData({
      name: "User",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "different456",
    });

    const result = await registerAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Passwords do not match");
  });

  it("returns error when createUser throws", async () => {
    mockCreateUser.mockRejectedValue(
      new Error("User with this email already exists"),
    );

    const fd = createFormData({
      name: "User",
      email: "existing@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const result = await registerAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("User with this email already exists");
  });

  it("returns generic error for non-Error exceptions", async () => {
    mockCreateUser.mockRejectedValue("string error");

    const fd = createFormData({
      name: "User",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const result = await registerAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("An unexpected error occurred");
  });

  it("calls createUser with correct input (without confirmPassword)", async () => {
    mockCreateUser.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      name: "A",
    });
    mockSignIn.mockResolvedValue(undefined);

    const fd = createFormData({
      name: "A",
      email: "a@b.com",
      password: "password123",
      confirmPassword: "password123",
    });

    await registerAction(fd);

    expect(mockCreateUser).toHaveBeenCalledWith({
      name: "A",
      email: "a@b.com",
      password: "password123",
    });
  });

  it("signs in automatically after successful registration", async () => {
    mockCreateUser.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      name: "A",
    });
    mockSignIn.mockResolvedValue(undefined);

    const fd = createFormData({
      name: "A",
      email: "a@b.com",
      password: "password123",
      confirmPassword: "password123",
    });

    await registerAction(fd);

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "a@b.com",
      password: "password123",
      redirect: false,
    });
  });
});
