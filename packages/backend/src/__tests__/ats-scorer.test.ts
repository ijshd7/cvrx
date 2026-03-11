import { describe, it, expect } from "vitest";
import { calculateAtsScore, extractKeywords } from "../services/ats-scorer";

describe("extractKeywords", () => {
  it("extracts words with 3+ characters", () => {
    const keywords = extractKeywords("we use React and Go for our apps");
    expect(keywords).toContain("react");
    expect(keywords).toContain("apps");
    expect(keywords).not.toContain("we");
    expect(keywords).not.toContain("go");
  });

  it("filters out stop words", () => {
    const keywords = extractKeywords(
      "the company needs expertise in software development",
    );
    expect(keywords).not.toContain("the");
    expect(keywords).not.toContain("in");
    expect(keywords).toContain("company");
    expect(keywords).toContain("expertise");
    expect(keywords).toContain("software");
    expect(keywords).toContain("development");
  });

  it("deduplicates keywords", () => {
    const keywords = extractKeywords("react react react typescript typescript");
    expect(keywords.filter((k) => k === "react")).toHaveLength(1);
    expect(keywords.filter((k) => k === "typescript")).toHaveLength(1);
  });

  it("filters out pure numbers", () => {
    const keywords = extractKeywords("need 5 years of 123 experience");
    expect(keywords).not.toContain("123");
    expect(keywords).toContain("years");
    expect(keywords).toContain("experience");
  });
});

describe("calculateAtsScore", () => {
  it("returns 100% when all keywords match", () => {
    const jd = "We need React and TypeScript experience";
    const resume = "I have experience with React and TypeScript";
    const result = calculateAtsScore(resume, jd);
    expect(result.score).toBe(100);
    expect(result.missingKeywords).toHaveLength(0);
  });

  it("returns 0% when no keywords match", () => {
    const jd = "Python Django Flask developer";
    const resume = "I know React TypeScript NextJS";
    const result = calculateAtsScore(resume, jd);
    expect(result.score).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
    expect(result.missingKeywords.length).toBeGreaterThan(0);
  });

  it("returns partial score for partial matches", () => {
    const jd = "React TypeScript Python Django";
    const resume = "I know React and TypeScript well";
    const result = calculateAtsScore(resume, jd);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
    expect(result.matchedKeywords).toContain("react");
    expect(result.matchedKeywords).toContain("typescript");
    expect(result.missingKeywords).toContain("python");
    expect(result.missingKeywords).toContain("django");
  });

  it("is case insensitive", () => {
    const jd = "REACT TYPESCRIPT";
    const resume = "react typescript";
    const result = calculateAtsScore(resume, jd);
    expect(result.score).toBe(100);
  });

  it("returns correct totalKeywords count", () => {
    const jd = "React TypeScript Python";
    const resume = "I know React";
    const result = calculateAtsScore(resume, jd);
    expect(result.totalKeywords).toBe(3);
  });

  it("handles empty job description", () => {
    const result = calculateAtsScore("some resume", "");
    expect(result.score).toBe(0);
    expect(result.totalKeywords).toBe(0);
  });
});
