import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RegisterForm } from "@/src/components/features/RegisterForm";
import * as authActions from "@/src/actions/auth-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/src/actions/auth-actions", () => ({
  registerAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("RegisterForm", () => {
  it("renders correctly", () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });

  it("submits data", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "t@t.com" },
    });

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwordInputs[0], {
      target: { value: "password123" },
    });
    fireEvent.change(passwordInputs[1], {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(authActions.registerAction).toHaveBeenCalled();
    });
  });
});
