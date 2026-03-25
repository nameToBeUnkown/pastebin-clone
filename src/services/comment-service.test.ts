import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/src/__tests__/mocks/prisma";
import { createComment, deleteComment, getCommentsByPasteId } from "@/src/services/comment-service";

type CommentResult = Awaited<ReturnType<typeof createComment>>;

const MOCK_COMMENT: CommentResult = {
  id: "comment-1",
  content: "Great paste!",
  createdAt: new Date(),
  pasteId: "paste-1",
  authorId: "user-1",
  author: { id: "user-1", name: "User 1", image: null },
};

describe("comment-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createComment", () => {
    it("creates a comment", async () => {
      prismaMock.comment.create.mockResolvedValue(MOCK_COMMENT);

      const result = await createComment({
        content: "Great paste!",
        pasteId: "paste-1"
      }, "user-1");

      expect(prismaMock.comment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          content: "Great paste!",
          paste: {
            connect: { id: "paste-1" },
          },
          author: {
            connect: { id: "user-1" },
          },
        },
      }));
      expect(result).toEqual(MOCK_COMMENT);
    });
  });

  describe("deleteComment", () => {
    it("deletes a comment if user is the author", async () => {
      prismaMock.comment.findUnique.mockResolvedValue(MOCK_COMMENT);
      prismaMock.comment.delete.mockResolvedValue(MOCK_COMMENT);

      await deleteComment("comment-1", "user-1");

      expect(prismaMock.comment.delete).toHaveBeenCalledWith({
        where: { id: "comment-1" },
      });
    });

    it("throws if comment not found", async () => {
      prismaMock.comment.findUnique.mockResolvedValue(null);

      await expect(deleteComment("comment-1", "user-1")).rejects.toThrow("Comment not found");
    });

    it("throws if user is not the author", async () => {
      prismaMock.comment.findUnique.mockResolvedValue(MOCK_COMMENT);

      await expect(deleteComment("comment-1", "user-2")).rejects.toThrow("Unauthorized");
    });
  });

  describe("getCommentsByPasteId", () => {
    it("fetches comments for a paste", async () => {
      prismaMock.comment.findMany.mockResolvedValue([MOCK_COMMENT]);

      const result = await getCommentsByPasteId("paste-1");

      expect(prismaMock.comment.findMany).toHaveBeenCalledWith({
        where: { pasteId: "paste-1" },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });
      expect(result).toEqual([MOCK_COMMENT]);
    });
  });
});
