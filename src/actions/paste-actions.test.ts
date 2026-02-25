import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock paste service
vi.mock("@/src/services/paste-service", () => ({
  createPaste: vi.fn(),
  deletePaste: vi.fn(),
  togglePasteVisibility: vi.fn(),
}));

import {
  createPasteAction,
  deletePasteAction,
  toggleVisibilityAction,
} from "@/src/actions/paste-actions";
import { auth } from "@/src/lib/auth";
import {
  createPaste,
  deletePaste,
  togglePasteVisibility,
} from "@/src/services/paste-service";

const mockAuth = vi.mocked(auth);
const mockCreatePaste = vi.mocked(createPaste);
const mockDeletePaste = vi.mocked(deletePaste);
const mockToggleVisibility = vi.mocked(togglePasteVisibility);

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

describe("createPasteAction", () => {
  const validFormData = {
    title: "Test Paste",
    content: "console.log('hi');",
    language: "javascript",
    expiration: "never",
  };

  it("creates paste successfully with auth", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockCreatePaste.mockResolvedValue({
      id: "paste-abc",
      title: "Test Paste",
      content: "console.log('hi');",
      language: "javascript",
      isPublic: true,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: "user-123",
    });

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(true);
    expect(result.pasteId).toBe("paste-abc");
  });

  it("creates paste without auth (anonymous)", async () => {
    mockAuth.mockResolvedValue(null);
    mockCreatePaste.mockResolvedValue({
      id: "paste-xyz",
      title: "Test",
      content: "x",
      language: "plaintext",
      isPublic: true,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: null,
    });

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(true);
    expect(mockCreatePaste).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Test Paste" }),
      undefined,
    );
  });

  it("returns validation error for invalid data", async () => {
    const fd = createFormData({
      title: "",
      content: "some content",
      language: "javascript",
      expiration: "never",
    });

    const result = await createPasteAction(fd);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns validation error for invalid language", async () => {
    const fd = createFormData({
      title: "Title",
      content: "content",
      language: "invalid-lang",
      expiration: "never",
    });

    const result = await createPasteAction(fd);

    expect(result.success).toBe(false);
  });

  it("returns error when service throws Error", async () => {
    mockAuth.mockResolvedValue(null);
    mockCreatePaste.mockRejectedValue(new Error("DB connection failed"));

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB connection failed");
  });

  it("returns generic error for non-Error exceptions", async () => {
    mockAuth.mockResolvedValue(null);
    mockCreatePaste.mockRejectedValue("unknown");

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create paste");
  });
});

describe("deletePasteAction", () => {
  it("deletes paste successfully", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockDeletePaste.mockResolvedValue(undefined);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(true);
    expect(mockDeletePaste).toHaveBeenCalledWith("paste-123", "user-123");
  });

  it("returns error when not logged in", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("You must be logged in");
  });

  it("returns error when service throws Error", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockDeletePaste.mockRejectedValue(new Error("Paste not found"));

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Paste not found");
  });

  it("returns generic error for non-Error exceptions", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockDeletePaste.mockRejectedValue(42);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to delete paste");
  });
});

describe("toggleVisibilityAction", () => {
  it("toggles visibility successfully", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockToggleVisibility.mockResolvedValue({
      id: "paste-123",
      title: "T",
      content: "C",
      language: "plaintext",
      isPublic: false,
      views: 0,
      expiresAt: null,
      createdAt: new Date(),
      authorId: "user-123",
    });

    const result = await toggleVisibilityAction("paste-123");

    expect(result.success).toBe(true);
    expect(mockToggleVisibility).toHaveBeenCalledWith("paste-123", "user-123");
  });

  it("returns error when not logged in", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await toggleVisibilityAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("You must be logged in");
  });

  it("returns error when service throws Error", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockToggleVisibility.mockRejectedValue(new Error("Unauthorized"));

    const result = await toggleVisibilityAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns generic error for non-Error exceptions", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    });
    mockToggleVisibility.mockRejectedValue(null);

    const result = await toggleVisibilityAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to toggle visibility");
  });
});
