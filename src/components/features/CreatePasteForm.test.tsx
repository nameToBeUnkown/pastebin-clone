import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreatePasteForm } from "@/src/components/features/CreatePasteForm";
import * as pasteActions from "@/src/actions/paste-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/src/actions/paste-actions", () => ({
  createPasteAction: vi
    .fn()
    .mockResolvedValue({ success: true, pasteId: "123" }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("CreatePasteForm", () => {
  it("renders form elements properly", () => {
    // Use a minimal mock for ResizeObserver/crypto if needed in vitest
    render(<CreatePasteForm />);

    expect(
      screen.getByPlaceholderText(/My awesome snippet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Paste your code here/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Create Paste/i)).toBeInTheDocument();
  });

  it("handles basic submission", async () => {
    render(<CreatePasteForm />);
    const titleInput = screen.getByPlaceholderText(
      /My awesome snippet/i,
    ) as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      /Paste your code here/i,
    ) as HTMLTextAreaElement;

    fireEvent.change(titleInput, { target: { value: "Test Paste" } });
    fireEvent.change(contentInput, { target: { value: "console.log('hi')" } });

    const submitBtn = screen.getByRole("button", { name: /Create Paste/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(pasteActions.createPasteAction).toHaveBeenCalled();
    });
  });

  it("allows toggling advanced options", async () => {
    render(<CreatePasteForm />);
    const advancedToggle = screen.getByText(/Advanced Options/i);
    fireEvent.click(advancedToggle);

    await waitFor(() => {
      expect(screen.getByText(/Expiration/i)).toBeInTheDocument();
    });
  });
});
