import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/src/components/layout/Footer";

describe("Footer", () => {
  it("renders copyright text", () => {
    render(<Footer />);

    expect(screen.getByText(/PasteBin Clone/)).toBeInTheDocument();
  });

  it("displays current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("mentions the tech stack", () => {
    render(<Footer />);

    expect(
      screen.getByText(/Next\.js.*Prisma.*TypeScript/),
    ).toBeInTheDocument();
  });

  it("renders as a footer element", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });
});
