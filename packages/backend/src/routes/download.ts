import { Router, Request, Response } from "express";
import { z } from "zod";
import { getTempFilePath, readTempFile } from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const paramsSchema = z.object({
  jobId: z.string().uuid(),
  docType: z.enum(["resume", "cv", "cover_letter", "why_company"]),
});

const querySchema = z.object({
  format: z.enum(["pdf", "docx"]).optional(),
});

router.get("/download/:jobId/:docType", (req: Request, res: Response) => {
  const paramsParsed = paramsSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid download parameters." });
    return;
  }

  const { jobId, docType } = paramsParsed.data;

  // Try both formats, prefer query param
  const queryParsed = querySchema.safeParse(req.query);
  const preferredFormat = queryParsed.success
    ? queryParsed.data.format
    : undefined;

  const formats = preferredFormat ? [preferredFormat] : ["pdf", "docx"];

  for (const format of formats) {
    const filePath = getTempFilePath(jobId, docType, format);
    const data = readTempFile(filePath);

    if (data) {
      const contentType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      const filename = `${docType}.${format}`;

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.send(data);
      return;
    }
  }

  res.status(404).json({ error: "File not found or expired." });
});

export default router;
