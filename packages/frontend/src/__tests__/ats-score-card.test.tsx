import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AtsScoreCard } from "@/components/ats-score-card";
import type { AtsScoreResult } from "@cvrx/shared";

describe("AtsScoreCard Component", () => {
  it("renders ATS Compatibility label", () => {
    const score: AtsScoreResult = {
      score: 75,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("ATS Compatibility")).toBeInTheDocument();
  });

  it("displays score percentage", () => {
    const score: AtsScoreResult = {
      score: 85,
      matchedKeywords: ["react"],
      missingKeywords: [],
      totalKeywords: 1,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders matched keywords section with keywords", () => {
    const score: AtsScoreResult = {
      score: 100,
      matchedKeywords: ["react", "typescript", "nodejs"],
      missingKeywords: [],
      totalKeywords: 3,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("Matched Keywords")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("nodejs")).toBeInTheDocument();
  });

  it("renders missing keywords section with keywords", () => {
    const score: AtsScoreResult = {
      score: 50,
      matchedKeywords: ["python"],
      missingKeywords: ["java", "golang", "rust"],
      totalKeywords: 4,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("Missing Keywords")).toBeInTheDocument();
    expect(screen.getByText("java")).toBeInTheDocument();
    expect(screen.getByText("golang")).toBeInTheDocument();
    expect(screen.getByText("rust")).toBeInTheDocument();
  });

  it("does not render matched keywords section when empty", () => {
    const score: AtsScoreResult = {
      score: 0,
      matchedKeywords: [],
      missingKeywords: ["react", "typescript"],
      totalKeywords: 2,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.queryByText("Matched Keywords")).not.toBeInTheDocument();
    expect(screen.getByText("Missing Keywords")).toBeInTheDocument();
  });

  it("does not render missing keywords section when empty", () => {
    const score: AtsScoreResult = {
      score: 100,
      matchedKeywords: ["react", "typescript"],
      missingKeywords: [],
      totalKeywords: 2,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("Matched Keywords")).toBeInTheDocument();
    expect(screen.queryByText("Missing Keywords")).not.toBeInTheDocument();
  });

  it("displays more badge when keywords exceed display limit", () => {
    const matchedKeywords = Array.from({ length: 15 }, (_, i) => `keyword${i}`);
    const score: AtsScoreResult = {
      score: 100,
      matchedKeywords,
      missingKeywords: [],
      totalKeywords: 15,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  it("displays more badge for missing keywords", () => {
    const missingKeywords = Array.from({ length: 10 }, (_, i) => `missing${i}`);
    const score: AtsScoreResult = {
      score: 50,
      matchedKeywords: [],
      missingKeywords,
      totalKeywords: 10,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("renders progress bar component", () => {
    const score: AtsScoreResult = {
      score: 75,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
    };
    const { container } = render(<AtsScoreCard score={score} />);
    // Check for progress component (Radix UI)
    const progressRoot = container.querySelector('[data-slot="progress"]');
    expect(progressRoot).toBeInTheDocument();
  });

  it("applies correct styling for high score (>=75)", () => {
    const score: AtsScoreResult = {
      score: 85,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
    };
    render(<AtsScoreCard score={score} />);
    const percentage = screen.getByText("85%");
    expect(percentage).toHaveClass("text-green-500");
  });

  it("applies correct styling for medium score (50-74)", () => {
    const score: AtsScoreResult = {
      score: 60,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
    };
    render(<AtsScoreCard score={score} />);
    const percentage = screen.getByText("60%");
    expect(percentage).toHaveClass("text-yellow-500");
  });

  it("applies correct styling for low score (<50)", () => {
    const score: AtsScoreResult = {
      score: 30,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
    };
    render(<AtsScoreCard score={score} />);
    const percentage = screen.getByText("30%");
    expect(percentage).toHaveClass("text-red-500");
  });

  it("limits matched keywords display to 12", () => {
    const matchedKeywords = Array.from({ length: 12 }, (_, i) => `keyword${i}`);
    const score: AtsScoreResult = {
      score: 100,
      matchedKeywords,
      missingKeywords: [],
      totalKeywords: 12,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("keyword0")).toBeInTheDocument();
    expect(screen.getByText("keyword11")).toBeInTheDocument();
  });

  it("limits missing keywords display to 8", () => {
    const missingKeywords = Array.from({ length: 8 }, (_, i) => `missing${i}`);
    const score: AtsScoreResult = {
      score: 50,
      matchedKeywords: [],
      missingKeywords,
      totalKeywords: 8,
    };
    render(<AtsScoreCard score={score} />);
    expect(screen.getByText("missing0")).toBeInTheDocument();
    expect(screen.getByText("missing7")).toBeInTheDocument();
  });
});
