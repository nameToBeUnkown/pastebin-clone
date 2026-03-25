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
    isPublic: "true",
  };

  it("creates paste successfully with auth", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    } as unknown as Awaited<ReturnType<typeof auth>>);
    mockCreatePaste.mockResolvedValue("paste-abc");

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(true);
    expect(result.pasteId).toBe("paste-abc");
  });

  it("creates paste without auth (anonymous)", async () => {
    mockAuth.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);
    mockCreatePaste.mockResolvedValue("paste-xyz");

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
});

describe("deletePasteAction", () => {
  it("deletes paste successfully", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    } as unknown as Awaited<ReturnType<typeof auth>>);
    mockDeletePaste.mockResolvedValue(undefined);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(true);
    expect(mockDeletePaste).toHaveBeenCalledWith("paste-123", "user-123");
  });

  it("returns error when not logged in", async () => {
    mockAuth.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("You must be logged in");
  });
});

describe("toggleVisibilityAction", () => {
  it("toggles visibility successfully", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "a@b.com", name: "A" },
      expires: "2099-01-01",
    } as unknown as Awaited<ReturnType<typeof auth>>);
    mockToggleVisibility.mockResolvedValue(undefined);

    const result = await toggleVisibilityAction("paste-123");

    expect(result.success).toBe(true);
    expect(mockToggleVisibility).toHaveBeenCalledWith("paste-123", "user-123");
  });
});
