import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DownloadCard } from "@/components/download-card";
import type { GenerateResponse } from "@cvrx/shared";

// Mock the api module
vi.mock("@/lib/api", () => ({
  getDownloadUrl: (path: string) => `http://example.com${path}`,
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
    outputFormat: "pdf",
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
    expect(screen.getAllByText("DOCX")).toBeTruthy();
  });

  it("renders four download buttons", () => {
    render(<DownloadCard result={mockResult} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
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

  it("renders download icons", () => {
    const { container } = render(<DownloadCard result={mockResult} />);
    // Check that SVG icons are rendered (lucide-react icons)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
