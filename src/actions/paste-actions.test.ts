import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

// Mock paste service
vi.mock("@/src/services/paste-service", () => ({
  createPaste: vi.fn(),
  deletePaste: vi.fn(),
  togglePasteVisibility: vi.fn(),
  getPasteById: vi.fn(),
  verifyPastePassword: vi.fn(),
  updatePaste: vi.fn(),
}));

import {
  createPasteAction,
  deletePasteAction,
  toggleVisibilityAction,
  getPasteContentAction,
  updatePasteAction,
} from "@/src/actions/paste-actions";
import { auth } from "@/src/lib/auth";
import {
  createPaste,
  deletePaste,
  togglePasteVisibility,
  getPasteById,
  verifyPastePassword,
  updatePaste,
} from "@/src/services/paste-service";

const mockAuth = vi.mocked(auth);
const mockCreatePaste = vi.mocked(createPaste);
const mockDeletePaste = vi.mocked(deletePaste);
const mockToggleVisibility = vi.mocked(togglePasteVisibility);
const mockGetPasteById = vi.mocked(getPasteById);
const mockVerifyPassword = vi.mocked(verifyPastePassword);
const mockUpdatePaste = vi.mocked(updatePaste);

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

type AuthResult = Awaited<ReturnType<typeof auth>>;
type PasteResult = Awaited<ReturnType<typeof getPasteById>>;

const DUMMY_SESSION: AuthResult = {
  user: { id: "u-123", email: "a@b.com", name: "A", image: null },
  expires: "2099-01-01",
};

const DUMMY_PASTE: PasteResult = {
  id: "p-abc",
  title: "Test Paste",
  content: "console.log(1)",
  language: "javascript",
  expiresAt: null,
  createdAt: new Date(),
  views: 0,
  authorId: "u-123",
  isPublic: true,
  passwordHash: null,
  author: { id: "u-123", name: "A", image: null },
  _count: { comments: 0 },
};

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
    mockAuth.mockResolvedValue(DUMMY_SESSION);
    mockCreatePaste.mockResolvedValue("p-abc");

    const fd = createFormData(validFormData);
    const result = await createPasteAction(fd);

    expect(result.success).toBe(true);
    expect(result.pasteId).toBe("p-abc");
  });

  it("creates paste without auth (anonymous)", async () => {
    mockAuth.mockResolvedValue(null);
    mockCreatePaste.mockResolvedValue("p-xyz");

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
    mockAuth.mockResolvedValue(DUMMY_SESSION);
    mockDeletePaste.mockResolvedValue(undefined);

    const result = await deletePasteAction("paste-123");

    expect(result.success).toBe(true);
    expect(mockDeletePaste).toHaveBeenCalledWith("paste-123", "u-123");
  });

  it("returns error when not logged in", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deletePasteAction("paste-123");
    expect(result.success).toBe(false);
    expect(result.error).toBe("You must be logged in");
  });
});

describe("toggleVisibilityAction", () => {
  it("toggles visibility successfully", async () => {
    mockAuth.mockResolvedValue(DUMMY_SESSION);
    mockToggleVisibility.mockResolvedValue(undefined);

    const result = await toggleVisibilityAction("p-abc");

    expect(result.success).toBe(true);
    expect(mockToggleVisibility).toHaveBeenCalledWith("p-abc", "u-123");
  });
});

describe("getPasteContentAction", () => {
  it("returns content if no password set", async () => {
    mockGetPasteById.mockResolvedValue(DUMMY_PASTE);
    const result = await getPasteContentAction("p-abc");
    expect(result.content).toBe("console.log(1)");
  });

  it("returns error if password required and not provided", async () => {
    if (DUMMY_PASTE) {
      mockGetPasteById.mockResolvedValue({ ...DUMMY_PASTE, passwordHash: "hashed" });
    }
    const result = await getPasteContentAction("p-abc");
    expect(result.error).toBe("Password required");
  });

  it("returns error if password incorrect", async () => {
    if (DUMMY_PASTE) {
      mockGetPasteById.mockResolvedValue({ ...DUMMY_PASTE, passwordHash: "hashed" });
    }
    mockVerifyPassword.mockResolvedValue(false);
    const result = await getPasteContentAction("p-abc", "wrong");
    expect(result.error).toBe("Incorrect password");
  });
});

describe("updatePasteAction", () => {
  it("updates successfully if authorized", async () => {
    mockAuth.mockResolvedValue(DUMMY_SESSION);
    mockGetPasteById.mockResolvedValue(DUMMY_PASTE);

    const result = await updatePasteAction("p-abc", { newContent: "new" });
    expect(result.success).toBe(true);
    expect(mockUpdatePaste).toHaveBeenCalled();
  });
});
