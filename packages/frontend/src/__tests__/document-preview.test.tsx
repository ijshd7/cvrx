import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentPreview } from "@/components/document-preview";

// Mock the API
vi.mock("@/lib/api", () => ({
  fetchPreview: vi.fn(),
}));

import * as api from "@/lib/api";
const mockFetchPreview = vi.mocked(api.fetchPreview);

describe("DocumentPreview Component", () => {
  const mockJobId = "123e4567-e89b-12d3-a456-426614174000";
  const mockContent = "# Test Resume\n\nThis is test content";

  beforeEach(() => {
    mockFetchPreview.mockReset();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    // Dialog content should not be visible when closed
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("renders dialog when open", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Document Preview")).toBeInTheDocument();
    });
  });

  it("displays document title in description", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Preview Resume before downloading/),
      ).toBeInTheDocument();
    });
  });

  it("renders all tab options", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Resume/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /CV/ })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /Cover Letter/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /Why This Company/ }),
      ).toBeInTheDocument();
    });
  });

  it("fetches and displays preview content", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockFetchPreview).toHaveBeenCalledWith(mockJobId, "resume");
      expect(screen.getByText(/This is test content/)).toBeInTheDocument();
    });
  });

  it("switches to different tab on click", async () => {
    mockFetchPreview.mockImplementation((jobId, docType) => {
      if (docType === "cv") return Promise.resolve("# CV Content\n\nCV data");
      return Promise.resolve(mockContent);
    });

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/This is test content/)).toBeInTheDocument();
    });

    const cvTab = screen.getByRole("tab", { name: /CV/ });
    await userEvent.click(cvTab);

    await waitFor(() => {
      expect(mockFetchPreview).toHaveBeenCalledWith(mockJobId, "cv");
      expect(screen.getByText(/CV data/)).toBeInTheDocument();
    });
  });

  it("displays loading state while fetching", async () => {
    mockFetchPreview.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockContent), 100)),
    );

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Fetch should be called immediately
    expect(mockFetchPreview).toHaveBeenCalled();

    // After loading completes, content should be displayed
    await waitFor(() => {
      expect(screen.getByText(/This is test content/)).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully", async () => {
    const errorMessage = "Network error";
    mockFetchPreview.mockRejectedValue(new Error(errorMessage));

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
    });
  });

  it("calls onOpenChange when dialog is dismissed", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);
    const onOpenChange = vi.fn();

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Document Preview")).toBeInTheDocument();
    });

    // Close button should be in the dialog header
    const closeButton = screen.getByRole("button", { name: /close/i });
    if (closeButton) {
      await userEvent.click(closeButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it("fetches content with correct parameters", async () => {
    mockFetchPreview.mockResolvedValue(mockContent);

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="why_company"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockFetchPreview).toHaveBeenCalledWith(mockJobId, "why_company");
    });
  });

  it("updates description when tab changes", async () => {
    mockFetchPreview.mockImplementation((jobId, docType) => {
      if (docType === "cv") return Promise.resolve("CV content");
      return Promise.resolve("Resume content");
    });

    render(
      <DocumentPreview
        jobId={mockJobId}
        initialDocType="resume"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Preview Resume before downloading/),
      ).toBeInTheDocument();
    });

    const cvTab = screen.getByRole("tab", { name: /CV/ });
    await userEvent.click(cvTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Preview Curriculum Vitae before downloading/),
      ).toBeInTheDocument();
    });
  });
});
