import { Router, Request, Response } from "express";
import { z } from "zod";
import archiver from "archiver";
import { getTempFilePath, readTempFile } from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const paramsSchema = z.object({
  jobId: z.string().uuid(),
  docType: z.enum(["resume", "cv", "cover_letter", "why_company", "linkedin_message"]),
});

const querySchema = z.object({
  format: z.enum(["pdf", "docx", "txt", "md"]).optional(),
});

const allParamsSchema = z.object({
  jobId: z.string().uuid(),
});

const allQuerySchema = z.object({
  format: z.enum(["pdf", "docx", "txt", "md"]),
});

const DOC_TYPES = ["resume", "cv", "cover_letter", "why_company", "linkedin_message"] as const;
const DOC_NAMES: Record<string, string> = {
  resume: "Resume",
  cv: "Curriculum_Vitae",
  cover_letter: "Cover_Letter",
  why_company: "Why_This_Company",
  linkedin_message: "LinkedIn_Message",
};

router.get("/download/:jobId/all", (req: Request, res: Response) => {
  const paramsParsed = allParamsSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid download parameters." });
    return;
  }

  const queryParsed = allQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: "Format query parameter is required." });
    return;
  }

  const { jobId } = paramsParsed.data;
  const { format } = queryParsed.data;

  const files: Array<{ name: string; data: Buffer }> = [];
  for (const docType of DOC_TYPES) {
    const filePath = getTempFilePath(jobId, docType, format);
    const data = readTempFile(filePath);
    if (!data) {
      res.status(404).json({ error: "File not found or expired." });
      return;
    }
    files.push({ name: `${DOC_NAMES[docType]}.${format}`, data });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="cvrx-documents.zip"',
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  for (const file of files) {
    archive.append(file.data, { name: file.name });
  }

  archive.finalize();
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

  const formats = preferredFormat
    ? [preferredFormat]
    : ["pdf", "docx", "txt", "md"];

  for (const format of formats) {
    const filePath = getTempFilePath(jobId, docType, format);
    const data = readTempFile(filePath);

    if (data) {
      const contentTypes: Record<string, string> = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        txt: "text/plain",
        md: "text/markdown",
      };
      const contentType = contentTypes[format] || "application/octet-stream";

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
