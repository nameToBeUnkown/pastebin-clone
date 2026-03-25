import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentItem } from "@/src/components/features/CommentItem";
import type { Comment } from "@/src/types/comment";

vi.mock("@/src/actions/comment-actions", () => ({
  deleteCommentAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const MOCK_COMMENT: Comment = {
  id: "c-1",
  content: "Test comment text",
  createdAt: new Date(),
  pasteId: "p-1",
  authorId: "u-1",
  author: {
    id: "u-1",
    name: "John Doe",
    image: null,
  },
};

describe("CommentItem", () => {
  it("renders comment content and author name", () => {
    render(<CommentItem comment={MOCK_COMMENT} />);
    
    expect(screen.getByText("Test comment text")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
  });

  it("shows delete button if current user is author", () => {
    render(<CommentItem comment={MOCK_COMMENT} currentUserId="u-1" />);
    expect(screen.queryByRole("button")).not.toBeNull();
  });

  it("does not show delete button if current user is not author", () => {
    render(<CommentItem comment={MOCK_COMMENT} currentUserId="u-2" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
