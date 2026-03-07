import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OutputFormatSelector } from "@/components/output-format-selector";

describe("OutputFormatSelector Component", () => {
  it("renders PDF and Word Document options", () => {
    const handleChange = vi.fn();
    render(<OutputFormatSelector value="pdf" onChange={handleChange} />);

    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("Word Document")).toBeInTheDocument();
  });

  it("displays output format heading", () => {
    const handleChange = vi.fn();
    render(<OutputFormatSelector value="pdf" onChange={handleChange} />);

    expect(screen.getByText("Output Format")).toBeInTheDocument();
  });

  it("highlights the selected format button with primary color", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <OutputFormatSelector value="pdf" onChange={handleChange} />,
    );

    const pdfButton = screen.getByRole("button", { name: /PDF/ });
    const docxButton = screen.getByRole("button", { name: /Word Document/ });

    expect(pdfButton).toHaveClass("border-primary");
    expect(docxButton).not.toHaveClass("border-primary");

    // Rerender with docx value
    rerender(<OutputFormatSelector value="docx" onChange={handleChange} />);

    expect(pdfButton).not.toHaveClass("border-primary");
    expect(docxButton).toHaveClass("border-primary");
  });

  it("calls onChange when a different format is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OutputFormatSelector value="pdf" onChange={handleChange} />);

    const docxButton = screen.getByRole("button", { name: /Word Document/ });
    await user.click(docxButton);

    expect(handleChange).toHaveBeenCalledWith("docx");
  });

  it("calls onChange when selecting the already-selected format", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OutputFormatSelector value="pdf" onChange={handleChange} />);

    const pdfButton = screen.getByRole("button", { name: /PDF/ });
    await user.click(pdfButton);

    expect(handleChange).toHaveBeenCalledWith("pdf");
  });

  it("renders format buttons with proper styling", () => {
    const handleChange = vi.fn();
    render(<OutputFormatSelector value="pdf" onChange={handleChange} />);

    const pdfButton = screen.getByRole("button", { name: /PDF/ });
    expect(pdfButton).toHaveClass("rounded-xl", "border-2");
  });
});
