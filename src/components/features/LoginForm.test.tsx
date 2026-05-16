import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "@/src/components/features/LoginForm";
import * as authActions from "@/src/actions/auth-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/src/actions/auth-actions", () => ({
  loginAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("LoginForm", () => {
  it("renders correctly", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("submits data", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const pwdInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(pwdInput, { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(authActions.loginAction).toHaveBeenCalled();
    });
  });
});
