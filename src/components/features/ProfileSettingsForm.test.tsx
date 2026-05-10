import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileSettingsForm } from "@/src/components/features/ProfileSettingsForm";
import * as userActions from "@/src/actions/user-actions";

vi.mock("@/src/actions/user-actions", () => ({
  updateProfileAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ProfileSettingsForm", () => {
  const user = { name: "Oleg", bio: "Dev", image: "" };

  it("renders the form", () => {
    render(<ProfileSettingsForm user={user} />);
    expect(screen.getByDisplayValue("Oleg")).toBeInTheDocument();
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
  });

  it("submits changes", async () => {
    render(<ProfileSettingsForm user={user} />);

    // Using role correctly? It's a button.
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(userActions.updateProfileAction).toHaveBeenCalled();
    });
  });
});
