import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasteCard } from "@/src/components/features/PasteCard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PasteCard", () => {
  const baseProps = {
    id: "paste-123",
    title: "My Snippet",
    language: "typescript",
    createdAt: new Date("2024-01-15T12:00:00Z"),
    views: 42,
  };

  it("renders paste title", () => {
    render(<PasteCard {...baseProps} />);
    expect(screen.getByText("My Snippet")).toBeInTheDocument();
  });

  it("renders language badge", () => {
    render(<PasteCard {...baseProps} />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("renders view count", () => {
    render(<PasteCard {...baseProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("links to correct paste URL", () => {
    render(<PasteCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/paste/paste-123");
  });

  it("renders author name when provided", () => {
    render(<PasteCard {...baseProps} author={{ name: "John Doe" }} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("does not render author when null", () => {
    render(<PasteCard {...baseProps} author={null} />);
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("shows 'just now' for recent pastes", () => {
    const recentDate = new Date(Date.now() - 5000); // 5 seconds ago
    render(<PasteCard {...baseProps} createdAt={recentDate} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("shows minutes ago for older pastes", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    render(<PasteCard {...baseProps} createdAt={fiveMinAgo} />);
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("shows hours ago for pastes older than 1 hour", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    render(<PasteCard {...baseProps} createdAt={twoHoursAgo} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("shows days ago for pastes older than 1 day", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    render(<PasteCard {...baseProps} createdAt={threeDaysAgo} />);
    expect(screen.getByText("3d ago")).toBeInTheDocument();
  });
});
