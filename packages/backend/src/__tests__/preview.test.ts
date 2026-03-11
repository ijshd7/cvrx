import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the validation schema directly without importing the route
const paramsSchema = z.object({
  jobId: z.string().uuid(),
  docType: z.enum(["resume", "cv", "cover_letter", "why_company"]),
});

describe("Preview Route Validation", () => {
  const mockJobId = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts valid jobId and docType", () => {
    const result = paramsSchema.safeParse({
      jobId: mockJobId,
      docType: "resume",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid jobId format", () => {
    const result = paramsSchema.safeParse({
      jobId: "invalid-id",
      docType: "resume",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid docType", () => {
    const result = paramsSchema.safeParse({
      jobId: mockJobId,
      docType: "invalid-type",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid docTypes", () => {
    const docTypes = ["resume", "cv", "cover_letter", "why_company"];

    docTypes.forEach((docType) => {
      const result = paramsSchema.safeParse({
        jobId: mockJobId,
        docType,
      });
      expect(result.success).toBe(true);
    });
  });

  it("rejects missing jobId", () => {
    const result = paramsSchema.safeParse({
      docType: "resume",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing docType", () => {
    const result = paramsSchema.safeParse({
      jobId: mockJobId,
    });
    expect(result.success).toBe(false);
  });

  it("validates UUID format strictly", () => {
    const validUUIDs = [
      "123e4567-e89b-12d3-a456-426614174000",
      "00000000-0000-0000-0000-000000000000",
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
    ];

    validUUIDs.forEach((uuid) => {
      const result = paramsSchema.safeParse({
        jobId: uuid,
        docType: "resume",
      });
      expect(result.success).toBe(true);
    });

    const invalidUUIDs = [
      "invalid",
      "123e4567-e89b-12d3-a456-42661417400",
      "123e4567-e89b-12d3-a456-4266141740000",
    ];

    invalidUUIDs.forEach((uuid) => {
      const result = paramsSchema.safeParse({
        jobId: uuid,
        docType: "resume",
      });
      expect(result.success).toBe(false);
    });
  });
});
