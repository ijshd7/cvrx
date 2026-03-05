import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { OutputFormat } from "@cvrx/shared";
import { upload } from "../middleware/upload";
import { scrapeJobListing } from "../services/scraper";
import { parseResume } from "../services/file-parser";
import { generateContent } from "../services/openrouter";
import { buildResumePrompt, buildCvPrompt } from "../services/prompt-builder";
import { generateDocument } from "../services/doc-generator";
import { ensureTempDir, getTempFilePath, writeTempFile } from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const generateSchema = z.object({
  model: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal("")),
  jobDescription: z.string().optional().or(z.literal("")),
  outputFormat: z.enum(["pdf", "docx"]),
});

router.post(
  "/generate",
  upload.single("resume"),
  async (req: Request, res: Response) => {
    try {
      const parsed = generateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid request",
          details: parsed.error.format(),
        });
        return;
      }

      const { model, jobUrl, jobDescription, outputFormat } = parsed.data;

      if (!req.file) {
        res.status(400).json({ error: "Resume file is required." });
        return;
      }

      // Get job description: try URL first, fall back to manual text
      let finalJobDescription = "";
      let scrapeError = "";

      if (jobUrl) {
        try {
          finalJobDescription = await scrapeJobListing(jobUrl);
        } catch (err) {
          scrapeError = (err as Error).message;
          console.warn("[Scraper] Failed to scrape URL:", scrapeError);
        }
      }

      if (!finalJobDescription && jobDescription) {
        finalJobDescription = jobDescription;
      }

      if (!finalJobDescription) {
        const message = scrapeError
          ? `Could not extract a job description from the URL: ${scrapeError}`
          : "Could not obtain job description. Please provide a URL or paste the description manually.";
        res.status(400).json({ error: message });
        return;
      }

      // Parse resume
      const resumeText = await parseResume(req.file.buffer, req.file.mimetype);

      // Generate resume and CV in parallel
      const resumePrompt = buildResumePrompt(resumeText, finalJobDescription);
      const cvPrompt = buildCvPrompt(resumeText, finalJobDescription);

      const [resumeContent, cvContent] = await Promise.all([
        generateContent(model, resumePrompt.system, resumePrompt.user),
        generateContent(model, cvPrompt.system, cvPrompt.user),
      ]);

      // Generate documents
      const format = outputFormat as OutputFormat;
      const [resumeDoc, cvDoc] = await Promise.all([
        generateDocument(resumeContent, format, "Resume"),
        generateDocument(cvContent, format, "Curriculum Vitae"),
      ]);

      // Save to temp directory
      const jobId = uuidv4();
      ensureTempDir(jobId);

      const resumePath = getTempFilePath(jobId, "resume", format);
      const cvPath = getTempFilePath(jobId, "cv", format);

      writeTempFile(resumePath, resumeDoc);
      writeTempFile(cvPath, cvDoc);

      res.json({
        jobId,
        resumeDownloadUrl: `/api/download/${jobId}/resume`,
        cvDownloadUrl: `/api/download/${jobId}/cv`,
        outputFormat: format,
      });
    } catch (err: unknown) {
      const error = err as Error & { status?: number; code?: string };
      console.error("[Generate]", {
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack,
      });

      const status = error.status && error.status >= 400 && error.status < 600
        ? error.status
        : 500;

      res.status(status).json({
        error: "Failed to generate documents.",
        details: error.message,
      });
    }
  }
);

export default router;
