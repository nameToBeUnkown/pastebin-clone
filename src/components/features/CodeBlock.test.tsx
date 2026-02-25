import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodeBlock } from "@/src/components/features/CodeBlock";

vi.mock("highlight.js", () => ({
  default: {
    highlightElement: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("CodeBlock", () => {
  it("renders code content", () => {
    render(<CodeBlock content="const x = 1;" language="javascript" />);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("displays language label", () => {
    render(<CodeBlock content="code" language="typescript" />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("renders copy button", () => {
    render(<CodeBlock content="code" language="python" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("copies content to clipboard on button click", () => {
    render(<CodeBlock content="hello world" language="plaintext" />);
    const copyBtn = screen.getByText("Copy");

    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("applies correct language class to code element", () => {
    const { container } = render(
      <CodeBlock content="code" language="python" />,
    );
    const codeEl = container.querySelector("code");
    expect(codeEl).toHaveClass("language-python");
  });

  it("renders within a pre element", () => {
    const { container } = render(
      <CodeBlock content="code" language="javascript" />,
    );
    expect(container.querySelector("pre")).toBeInTheDocument();
  });
});
