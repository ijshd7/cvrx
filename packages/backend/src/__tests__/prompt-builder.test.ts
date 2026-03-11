import { describe, it, expect } from "vitest";
import {
  buildResumePrompt,
  buildCvPrompt,
  buildCoverLetterPrompt,
  buildWhyCompanyPrompt,
  getToneInstructions,
} from "../services/prompt-builder";

describe("Prompt Builder", () => {
  const sampleResume = `John Doe
  Senior Software Engineer

  Professional Experience:
  - Developed REST APIs using Node.js and Express
  - Led team of 5 engineers
  `;

  const sampleJobDescription = `We're looking for a Senior Software Engineer with:
  - 5+ years of experience with Node.js and Express
  - Experience leading engineering teams
  - RESTful API development experience
  `;

  describe("buildResumePrompt", () => {
    it("returns system and user prompts", () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription);
      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("includes resume text in user prompt", () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleResume);
    });

    it("includes job description in user prompt", () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleJobDescription);
    });

    it("mentions ATS optimization in system prompt", () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("ats");
    });

    it("includes guidance about action verbs in system prompt", () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("action verb");
    });
  });

  describe("buildCvPrompt", () => {
    it("returns system and user prompts", () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription);
      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("includes resume text in user prompt", () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleResume);
    });

    it("includes job description in user prompt", () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleJobDescription);
    });

    it("mentions comprehensive CV in system prompt", () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("comprehensive");
    });

    it("mentions relevance mapping in system prompt", () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("relevance");
    });
  });

  describe("buildCoverLetterPrompt", () => {
    it("returns system and user prompts", () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription);
      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("includes resume text in user prompt", () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleResume);
    });

    it("includes job description in user prompt", () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleJobDescription);
    });

    it("mentions single-page format in system prompt", () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("single-page");
    });

    it("mentions hiring manager greeting in system prompt", () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription);
      expect(result.system).toContain("Dear Hiring Manager");
    });
  });

  describe("buildWhyCompanyPrompt", () => {
    it("returns system and user prompts", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result).toHaveProperty("system");
      expect(result).toHaveProperty("user");
      expect(typeof result.system).toBe("string");
      expect(typeof result.user).toBe("string");
    });

    it("includes resume text in user prompt", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleResume);
    });

    it("includes job description in user prompt", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result.user).toContain(sampleJobDescription);
    });

    it("mentions company in system prompt", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("company");
    });

    it("specifies 3-4 sentences in system prompt", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result.system).toContain("3-4 sentences");
    });

    it("requires first person in system prompt", () => {
      const result = buildWhyCompanyPrompt(sampleResume, sampleJobDescription);
      expect(result.system.toLowerCase()).toContain("first person");
    });
  });

  describe("getToneInstructions", () => {
    it("returns empty string for professional tone", () => {
      const result = getToneInstructions("professional");
      expect(result).toBe("");
    });

    it("returns conversational instructions", () => {
      const result = getToneInstructions("conversational");
      expect(result.toLowerCase()).toContain("warm");
      expect(result.toLowerCase()).toContain("approachable");
    });

    it("returns confident instructions", () => {
      const result = getToneInstructions("confident");
      expect(result.toLowerCase()).toContain("assertive");
    });

    it("returns conservative instructions", () => {
      const result = getToneInstructions("conservative");
      expect(result.toLowerCase()).toContain("formal");
    });

    it("returns distinct instructions for each tone", () => {
      const tones = [
        "conversational",
        "confident",
        "conservative",
      ] as const;
      const results = tones.map((t) => getToneInstructions(t));
      const unique = new Set(results);
      expect(unique.size).toBe(3);
    });
  });

  describe("tone integration with prompts", () => {
    it("includes conversational tone in resume prompt", () => {
      const result = buildResumePrompt(
        sampleResume,
        sampleJobDescription,
        "conversational",
      );
      expect(result.system.toLowerCase()).toContain("warm");
    });

    it("default tone produces same output as professional", () => {
      const defaultResult = buildResumePrompt(
        sampleResume,
        sampleJobDescription,
      );
      const proResult = buildResumePrompt(
        sampleResume,
        sampleJobDescription,
        "professional",
      );
      expect(defaultResult.system).toBe(proResult.system);
    });
  });
});
