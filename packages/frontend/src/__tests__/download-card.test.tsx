import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadCard } from "@/components/download-card";
import type { GenerateResponse } from "@cvrx/shared";

// Mock the api module
vi.mock("@/lib/api", () => ({
  getDownloadUrl: (path: string) => `http://example.com${path}`,
  getAllDownloadUrl: (jobId: string, format: string) =>
    `http://example.com/download/${jobId}/all?format=${format}`,
  fetchPreview: vi.fn().mockResolvedValue("preview content"),
}));

// Mock the DocumentPreview component
vi.mock("@/components/document-preview", () => ({
  DocumentPreview: ({
    jobId,
    initialDocType,
    open,
    onOpenChange,
  }: {
    jobId: string;
    initialDocType: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid={`preview-dialog-${initialDocType}`}
      data-open={open}
      onClick={() => onOpenChange(false)}
    >
      Preview Dialog: {initialDocType}
    </div>
  ),
}));

describe("DownloadCard Component", () => {
  const mockResult: GenerateResponse = {
    jobId: "123e4567-e89b-12d3-a456-426614174000",
    resumeDownloadUrl:
      "/api/download/123e4567-e89b-12d3-a456-426614174000/resume",
    cvDownloadUrl: "/api/download/123e4567-e89b-12d3-a456-426614174000/cv",
    coverLetterDownloadUrl:
      "/api/download/123e4567-e89b-12d3-a456-426614174000/cover_letter",
    whyCompanyDownloadUrl:
      "/api/download/123e4567-e89b-12d3-a456-426614174000/why_company",
    linkedinMessageDownloadUrl:
      "/api/download/123e4567-e89b-12d3-a456-426614174000/linkedin_message",
    outputFormat: "pdf",
    atsScore: {
      score: 85,
      matchedKeywords: ["react", "typescript", "nodejs"],
      missingKeywords: ["python", "django"],
      totalKeywords: 5,
    },
  };

  it("renders the success card title", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByText("Documents Ready")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<DownloadCard result={mockResult} />);
    expect(
      screen.getByText(/tailored application package/),
    ).toBeInTheDocument();
  });

  it("displays PDF format label when outputFormat is pdf", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Curriculum Vitae")).toBeInTheDocument();
    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(screen.getByText("Why This Company")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn Message")).toBeInTheDocument();
    expect(screen.getAllByText("PDF")).toBeTruthy();
  });

  it("displays DOCX format label when outputFormat is docx", () => {
    const docxResult: GenerateResponse = {
      ...mockResult,
      outputFormat: "docx",
    };
    render(<DownloadCard result={docxResult} />);
    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Curriculum Vitae")).toBeInTheDocument();
    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(screen.getByText("Why This Company")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn Message")).toBeInTheDocument();
    expect(screen.getAllByText("DOCX")).toBeTruthy();
  });

  it("renders download buttons including Download All", () => {
    render(<DownloadCard result={mockResult} />);
    const buttons = screen.getAllByRole("button");
    // Download All + 5 download + 5 preview + 2 copy buttons = 13+
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("renders Download All button with correct href", () => {
    render(<DownloadCard result={mockResult} />);
    const allLink = screen.getByRole("link", { name: /Download All/ });
    expect(allLink).toHaveAttribute(
      "href",
      expect.stringContaining("/all?format=pdf"),
    );
    expect(allLink).toHaveAttribute("download");
  });

  it("sets correct href for resume download link", () => {
    render(<DownloadCard result={mockResult} />);
    const resumeLink = screen.getByRole("link", { name: /Resume/ });
    expect(resumeLink).toHaveAttribute(
      "href",
      expect.stringContaining("resume"),
    );
    expect(resumeLink).toHaveAttribute("download");
  });

  it("sets correct href for CV download link", () => {
    render(<DownloadCard result={mockResult} />);
    const cvLink = screen.getByRole("link", { name: /Curriculum Vitae/ });
    expect(cvLink).toHaveAttribute("href", expect.stringContaining("cv"));
    expect(cvLink).toHaveAttribute("download");
  });

  it("sets correct href for cover letter download link", () => {
    render(<DownloadCard result={mockResult} />);
    const coverLetterLink = screen.getByRole("link", { name: /Cover Letter/ });
    expect(coverLetterLink).toHaveAttribute(
      "href",
      expect.stringContaining("cover_letter"),
    );
    expect(coverLetterLink).toHaveAttribute("download");
  });

  it("sets correct href for why company download link", () => {
    render(<DownloadCard result={mockResult} />);
    const whyCompanyLink = screen.getByRole("link", {
      name: /Why This Company/,
    });
    expect(whyCompanyLink).toHaveAttribute(
      "href",
      expect.stringContaining("why_company"),
    );
    expect(whyCompanyLink).toHaveAttribute("download");
  });

  it("applies proper styling classes to links", () => {
    render(<DownloadCard result={mockResult} />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveClass("block");
    });
  });

  it("displays TXT format label when outputFormat is txt", () => {
    const txtResult: GenerateResponse = {
      ...mockResult,
      outputFormat: "txt",
    };
    render(<DownloadCard result={txtResult} />);
    expect(screen.getAllByText("TXT")).toBeTruthy();
  });

  it("displays MD format label when outputFormat is md", () => {
    const mdResult: GenerateResponse = {
      ...mockResult,
      outputFormat: "md",
    };
    render(<DownloadCard result={mdResult} />);
    expect(screen.getAllByText("MD")).toBeTruthy();
  });

  it("renders download icons", () => {
    const { container } = render(<DownloadCard result={mockResult} />);
    // Check that SVG icons are rendered (lucide-react icons)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders ATS score section with score percentage", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByText("ATS Compatibility")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders matched keywords in ATS score", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("nodejs")).toBeInTheDocument();
  });

  it("renders missing keywords in ATS score", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("django")).toBeInTheDocument();
  });

  it("renders preview Eye buttons for each document", () => {
    const { container } = render(<DownloadCard result={mockResult} />);
    // Find all Eye icon buttons by finding buttons with SVG children
    const buttons = screen.getAllByRole("button");
    // Should have: Download All + 5 download + 5 preview + 2 copy = 13 buttons
    expect(buttons.length).toBeGreaterThanOrEqual(12);
  });

  it("opens preview dialog when Eye button is clicked", async () => {
    const user = userEvent.setup();
    render(<DownloadCard result={mockResult} />);

    // Get all buttons and find the first preview button
    // (after the Download All and first download button)
    const buttons = screen.getAllByRole("button");
    const firstPreviewButton = buttons[2]; // After Download All and Resume download

    await user.click(firstPreviewButton);

    // Preview dialog should be rendered with resume as initial doc type
    expect(screen.getByTestId("preview-dialog-resume")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("renders DocumentPreview component", () => {
    render(<DownloadCard result={mockResult} />);
    expect(screen.getByTestId("preview-dialog-resume")).toBeInTheDocument();
  });
});
