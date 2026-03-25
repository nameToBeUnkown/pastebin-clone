import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentForm } from "@/src/components/features/CommentForm";

vi.mock("react-dom", () => ({
  ...vi.importActual("react-dom"),
  useFormStatus: () => ({ pending: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/src/actions/comment-actions", () => ({
  createCommentAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("CommentForm", () => {
  it("renders textarea and submit button", () => {
    render(<CommentForm pasteId="p-1" />);
    
    expect(screen.getByPlaceholderText("Write a comment...")).toBeDefined();
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("updates textarea on change", () => {
    render(<CommentForm pasteId="p-1" />);
    const textarea = screen.getByPlaceholderText("Write a comment...") as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: "Cool stuff!" } });
    expect(textarea.value).toBe("Cool stuff!");
  });
});
