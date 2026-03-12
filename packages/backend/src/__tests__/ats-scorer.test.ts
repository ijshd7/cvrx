import { describe, it, expect } from "vitest";
import { calculateAtsScore, extractKeywords, extractPhrases } from "../services/ats-scorer";

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
  it("returns high score when all keywords and phrases match", () => {
    const jd = "We need React and TypeScript experience";
    const resume = "I have experience with React and TypeScript";
    const result = calculateAtsScore(resume, jd);
    // With phrase matching, score includes both keyword and phrase weights
    expect(result.score).toBeGreaterThanOrEqual(60);
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
    // All keywords and phrases should match (case insensitive)
    expect(result.missingKeywords).toHaveLength(0);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it("returns totalKeywords count including phrases", () => {
    const jd = "React TypeScript Python";
    const resume = "I know React";
    const result = calculateAtsScore(resume, jd);
    // totalKeywords now includes both single keywords and extracted phrases
    expect(result.totalKeywords).toBeGreaterThanOrEqual(3);
  });

  it("handles empty job description", () => {
    const result = calculateAtsScore("some resume", "");
    expect(result.score).toBe(0);
    expect(result.totalKeywords).toBe(0);
  });

  it("returns matched and missing phrases", () => {
    const jd = "Looking for project management and data analysis skills";
    const resume = "Experience in project management and team leadership";
    const result = calculateAtsScore(resume, jd);
    expect(result.matchedPhrases).toBeDefined();
    expect(result.missingPhrases).toBeDefined();
    expect(result.matchedPhrases!.some((p) => p.includes("project"))).toBe(true);
  });

  it("matches synonyms (js = javascript)", () => {
    const jd = "Must know JavaScript and Node.js";
    const resume = "Proficient in JS and NodeJS development";
    const result = calculateAtsScore(resume, jd);
    expect(result.matchedKeywords).toContain("javascript");
  });
});

describe("extractPhrases", () => {
  it("extracts bigrams from text", () => {
    const phrases = extractPhrases("project management experience");
    expect(phrases.some((p) => p.includes("project management"))).toBe(true);
  });

  it("filters out pure stop-word phrases", () => {
    const phrases = extractPhrases("the and but or");
    // All are stop words, so no meaningful phrases
    expect(phrases.length).toBe(0);
  });
});
