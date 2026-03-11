import { describe, it, expect } from "vitest";
import { getDownloadUrl, getAllDownloadUrl } from "@/lib/api";

describe("API Utilities", () => {
  describe("getDownloadUrl", () => {
    it("prepends API_BASE to a path", () => {
      const result = getDownloadUrl("/download/123/resume");
      expect(result).toBe("/api/download/123/resume");
    });

    it("strips /api prefix if path starts with /api", () => {
      const result = getDownloadUrl("/api/download/456/cv");
      expect(result).toBe("/api/download/456/cv");
    });

    it("handles paths with /api in the middle", () => {
      const result = getDownloadUrl("/api/other/path");
      expect(result).toBe("/api/other/path");
    });

    it("works with various document types", () => {
      const result1 = getDownloadUrl("/download/123/resume");
      const result2 = getDownloadUrl("/download/123/cv");
      const result3 = getDownloadUrl("/download/123/cover_letter");

      expect(result1).toContain("resume");
      expect(result2).toContain("cv");
      expect(result3).toContain("cover_letter");
    });

    it("handles empty string", () => {
      const result = getDownloadUrl("");
      expect(result).toBe("/api");
    });

    it("handles root path", () => {
      const result = getDownloadUrl("/");
      expect(result).toBe("/api/");
    });

    it("correctly replaces first occurrence of /api", () => {
      // If a path happens to have /api in it (unusual but possible)
      const result = getDownloadUrl("/api/api/test");
      expect(result).toBe("/api/api/test");
    });
  });

  describe("getAllDownloadUrl", () => {
    it("constructs correct URL with jobId and format", () => {
      const result = getAllDownloadUrl("abc-123", "pdf");
      expect(result).toBe("/api/download/abc-123/all?format=pdf");
    });

    it("works with different formats", () => {
      expect(getAllDownloadUrl("id", "docx")).toContain("format=docx");
      expect(getAllDownloadUrl("id", "txt")).toContain("format=txt");
      expect(getAllDownloadUrl("id", "md")).toContain("format=md");
    });
  });
});
