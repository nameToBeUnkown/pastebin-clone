import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

// Mock comment service
vi.mock("@/src/services/comment-service", () => ({
  createComment: vi.fn(),
  deleteComment: vi.fn(),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createCommentAction, deleteCommentAction } from "@/src/actions/comment-actions";
import { auth } from "@/src/lib/auth";
import { createComment, deleteComment } from "@/src/services/comment-service";
import { revalidatePath } from "next/cache";

const mockAuth = vi.mocked(auth);
const mockCreateComment = vi.mocked(createComment);
const mockDeleteComment = vi.mocked(deleteComment);
const mockRevalidatePath = vi.mocked(revalidatePath);

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

type AuthResult = Awaited<ReturnType<typeof auth>>;
type CommentResult = Awaited<ReturnType<typeof createComment>>;

const DUMMY_SESSION: AuthResult = {
  user: { id: "user-1", email: "a@b.com", name: "A", image: null },
  expires: "2099-01-01",
};

const DUMMY_COMMENT: CommentResult = {
  id: "c1",
  content: "hello",
  createdAt: new Date(),
  pasteId: "p1",
  authorId: "user-1",
  author: { id: "user-1", name: "User 1", image: null },
};

describe("comment-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCommentAction", () => {
    it("creates a comment successfully", async () => {
      mockAuth.mockResolvedValue(DUMMY_SESSION);
      mockCreateComment.mockResolvedValue(DUMMY_COMMENT);

      const fd = createFormData({ content: "Hello", pasteId: "paste-1" });
      const result = await createCommentAction(fd);

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/paste/paste-1");
    });

    it("returns error if not logged in", async () => {
      mockAuth.mockResolvedValue(null);
      const fd = createFormData({ content: "Hello", pasteId: "paste-1" });
      const result = await createCommentAction(fd);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to comment");
    });
  });

  describe("deleteCommentAction", () => {
    it("deletes a comment successfully", async () => {
      mockAuth.mockResolvedValue(DUMMY_SESSION);
      mockDeleteComment.mockResolvedValue(undefined);

      const result = await deleteCommentAction("comment-1", "paste-1");

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/paste/paste-1");
    });
  });
});
