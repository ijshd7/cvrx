import { describe, it, expect } from "vitest";
import { sanitizeGeneratedContent } from "../services/content-sanitizer";

const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

describe("content-sanitizer", () => {
  describe("em-dash replacement", () => {
    it("replaces em-dash with comma and space", () => {
      expect(sanitizeGeneratedContent(`X${EM_DASH}Y`)).toBe("X, Y");
    });

    it("replaces multiple em-dashes", () => {
      expect(
        sanitizeGeneratedContent(`A${EM_DASH}B${EM_DASH}C`),
      ).toBe("A, B, C");
    });
  });

  describe("banned phrase replacement", () => {
    it("replaces 'Passionate about' with 'Interested in'", () => {
      expect(
        sanitizeGeneratedContent("Passionate about privacy-first products"),
      ).toBe("Interested in privacy-first products");
    });

    it("replaces 'Passionate' with 'Interested' when standalone", () => {
      expect(sanitizeGeneratedContent("I am Passionate and driven.")).toBe(
        "I am Interested and driven.",
      );
    });

    it("replaces phrases case-insensitively", () => {
      expect(sanitizeGeneratedContent("passionate about X")).toBe(
        "interested in X",
      );
    });

    it("replaces multiple banned phrases in one document", () => {
      const input =
        "Results-driven engineer. Leveraging cutting-edge tech. Spearheaded initiatives.";
      const output = sanitizeGeneratedContent(input);
      expect(output).toContain("Focused on results");
      expect(output).toContain("Using");
      expect(output).toContain("modern"); // case preserved from "cutting-edge"
      expect(output).toContain("Led");
    });
  });

  describe("date range en-dash replacement", () => {
    it("replaces en-dash in month-year date ranges", () => {
      expect(
        sanitizeGeneratedContent(`May 2021 ${EN_DASH} Present`),
      ).toBe("May 2021 - Present");
    });

    it("replaces en-dash in year-year ranges", () => {
      expect(sanitizeGeneratedContent(`2021 ${EN_DASH} 2023`)).toBe(
        "2021 - 2023",
      );
    });
  });

  describe("markdown preservation", () => {
    it("preserves markdown structure", () => {
      const input = "## Summary\n\n**Bold text** and - bullet points";
      const output = sanitizeGeneratedContent(input);
      expect(output).toBe(input);
    });

    it("preserves content when no replacements needed", () => {
      const input = "Developed scalable web applications using React.";
      expect(sanitizeGeneratedContent(input)).toBe(input);
    });
  });

  describe("combined transformations", () => {
    it("applies em-dash and phrase replacements together", () => {
      const input = `Passionate about X${EM_DASH}and Leveraging Y`;
      const output = sanitizeGeneratedContent(input);
      expect(output).toBe("Interested in X, and Using Y");
    });
  });
});
