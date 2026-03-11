import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToneSelector } from "@/components/tone-selector";

describe("ToneSelector Component", () => {
  it("renders all four tone options", () => {
    const handleChange = vi.fn();
    render(<ToneSelector value="professional" onChange={handleChange} />);

    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Conversational")).toBeInTheDocument();
    expect(screen.getByText("Confident")).toBeInTheDocument();
    expect(screen.getByText("Conservative")).toBeInTheDocument();
  });

  it("displays writing tone heading", () => {
    const handleChange = vi.fn();
    render(<ToneSelector value="professional" onChange={handleChange} />);

    expect(screen.getByText("Writing Tone")).toBeInTheDocument();
  });

  it("highlights the selected tone with primary color", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <ToneSelector value="professional" onChange={handleChange} />,
    );

    const proButton = screen.getByRole("button", { name: /Professional/ });
    const convButton = screen.getByRole("button", { name: /Conversational/ });

    expect(proButton).toHaveClass("border-primary");
    expect(convButton).not.toHaveClass("border-primary");

    rerender(
      <ToneSelector value="conversational" onChange={handleChange} />,
    );

    expect(proButton).not.toHaveClass("border-primary");
    expect(convButton).toHaveClass("border-primary");
  });

  it("calls onChange when a different tone is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ToneSelector value="professional" onChange={handleChange} />);

    const confidentButton = screen.getByRole("button", { name: /Confident/ });
    await user.click(confidentButton);

    expect(handleChange).toHaveBeenCalledWith("confident");
  });

  it("calls onChange when selecting conservative tone", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ToneSelector value="professional" onChange={handleChange} />);

    const conservativeButton = screen.getByRole("button", {
      name: /Conservative/,
    });
    await user.click(conservativeButton);

    expect(handleChange).toHaveBeenCalledWith("conservative");
  });

  it("renders tone buttons with proper styling", () => {
    const handleChange = vi.fn();
    render(<ToneSelector value="professional" onChange={handleChange} />);

    const proButton = screen.getByRole("button", { name: /Professional/ });
    expect(proButton).toHaveClass("rounded-xl", "border-2");
  });
});
