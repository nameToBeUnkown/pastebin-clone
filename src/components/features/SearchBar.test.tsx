import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "@/src/components/features/SearchBar";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("Search pastes...")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      "Search pastes...",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "hello" } });
    expect(input.value).toBe("hello");
  });

  it("navigates with query on submit", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search pastes...");
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "test query" } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith("/?q=test%20query");
  });

  it("navigates to home when query is empty", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search pastes...");
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("trims whitespace from query", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search pastes...");
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "  hello  " } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith("/?q=hello");
  });

  it("renders as a form element", () => {
    const { container } = render(<SearchBar />);
    expect(container.querySelector("form")).toBeInTheDocument();
  });
});
