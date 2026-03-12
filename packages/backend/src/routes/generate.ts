import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type {
  OutputFormat,
  ToneStyle,
  GenerateProgressEvent,
  GenerateResponse,
} from "@cvrx/shared";
import { upload } from "../middleware/upload";
import { scrapeJobListing } from "../services/scraper";
import { parseResume } from "../services/file-parser";
import { generateContent } from "../services/openrouter";
import {
  buildResumePrompt,
  buildCvPrompt,
  buildCoverLetterPrompt,
  buildWhyCompanyPrompt,
  buildLinkedInMessagePrompt,
} from "../services/prompt-builder";
import { generateDocument } from "../services/doc-generator";
import { sanitizeGeneratedContent } from "../services/content-sanitizer";
import { calculateAtsScore } from "../services/ats-scorer";
import {
  ensureTempDir,
  getTempFilePath,
  writeTempFile,
} from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const generateSchema = z.object({
  model: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal("")),
  jobDescription: z.string().optional().or(z.literal("")),
  outputFormat: z.enum(["pdf", "docx", "txt", "md"]),
  tone: z
    .enum(["professional", "conversational", "confident", "conservative"])
    .default("professional"),
  additionalContext: z.string().optional().or(z.literal("")),
});

function sendSSE(res: Response, event: GenerateProgressEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

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

      const { model, jobUrl, jobDescription, outputFormat, tone, additionalContext } = parsed.data;

      if (!req.file) {
        res.status(400).json({ error: "Resume file is required." });
        return;
      }

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Get job description: try URL first, fall back to manual text
      let finalJobDescription = "";
      let scrapeError = "";

      if (jobUrl) {
        sendSSE(res, {
          step: "scraping",
          progress: 5,
          message: "Scraping job listing...",
        });
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
        sendSSE(res, { step: "scraping", progress: 0, message });
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
        return;
      }

      // Parse resume
      sendSSE(res, {
        step: "parsing",
        progress: 15,
        message: "Parsing resume...",
      });
      const resumeText = await parseResume(req.file.buffer, req.file.mimetype);

      // Generate resume, CV, and cover letter in parallel
      sendSSE(res, {
        step: "generating_resume",
        progress: 20,
        message: "Generating tailored resume...",
      });
      const toneStyle = tone as ToneStyle;
      const resumePrompt = buildResumePrompt(
        resumeText,
        finalJobDescription,
        toneStyle,
        additionalContext,
      );
      const cvPrompt = buildCvPrompt(
        resumeText,
        finalJobDescription,
        toneStyle,
        additionalContext,
      );
      const coverLetterPrompt = buildCoverLetterPrompt(
        resumeText,
        finalJobDescription,
        toneStyle,
        additionalContext,
      );
      const whyCompanyPrompt = buildWhyCompanyPrompt(
        resumeText,
        finalJobDescription,
        toneStyle,
        additionalContext,
      );
      const linkedinMessagePrompt = buildLinkedInMessagePrompt(
        resumeText,
        finalJobDescription,
        toneStyle,
        additionalContext,
      );

      const [resumeContent, cvContent, coverLetterContent, whyCompanyContent, linkedinMessageContent] =
        await Promise.all([
          generateContent(model, resumePrompt.system, resumePrompt.user).then(
            (result) => {
              sendSSE(res, {
                step: "generating_cv",
                progress: 25,
                message: "Generating CV...",
              });
              return sanitizeGeneratedContent(result);
            },
          ),
          generateContent(model, cvPrompt.system, cvPrompt.user).then(
            (result) => {
              sendSSE(res, {
                step: "generating_cover_letter",
                progress: 35,
                message: "Generating cover letter...",
              });
              return sanitizeGeneratedContent(result);
            },
          ),
          generateContent(
            model,
            coverLetterPrompt.system,
            coverLetterPrompt.user,
          ).then((result) => {
            sendSSE(res, {
              step: "generating_why_company",
              progress: 45,
              message: "Generating 'Why this company?' response...",
            });
            return sanitizeGeneratedContent(result);
          }),
          generateContent(
            model,
            whyCompanyPrompt.system,
            whyCompanyPrompt.user,
          ).then((result) => {
            sendSSE(res, {
              step: "generating_linkedin_message",
              progress: 55,
              message: "Generating LinkedIn outreach messages...",
            });
            return sanitizeGeneratedContent(result);
          }),
          generateContent(
            model,
            linkedinMessagePrompt.system,
            linkedinMessagePrompt.user,
          ).then((result) => sanitizeGeneratedContent(result)),
        ]);

      // Calculate ATS score
      sendSSE(res, {
        step: "scoring_ats",
        progress: 65,
        message: "Calculating ATS compatibility...",
      });
      const atsScore = calculateAtsScore(resumeContent, finalJobDescription);

      // Generate documents
      sendSSE(res, {
        step: "building_documents",
        progress: 70,
        message: "Building documents...",
      });
      const format = outputFormat as OutputFormat;
      const [resumeDoc, cvDoc, coverLetterDoc, whyCompanyDoc, linkedinMessageDoc] =
        await Promise.all([
          generateDocument(resumeContent, format, "Resume"),
          generateDocument(cvContent, format, "Curriculum Vitae"),
          generateDocument(coverLetterContent, format, "Cover Letter"),
          generateDocument(whyCompanyContent, format, "Why This Company"),
          generateDocument(linkedinMessageContent, format, "LinkedIn Message"),
        ]);

      // Save to temp directory
      const jobId = uuidv4();
      ensureTempDir(jobId);

      // Save metadata for regeneration
      writeTempFile(
        getTempFilePath(jobId, "meta_resume", "txt"),
        Buffer.from(resumeText),
      );
      writeTempFile(
        getTempFilePath(jobId, "meta_jd", "txt"),
        Buffer.from(finalJobDescription),
      );
      writeTempFile(
        getTempFilePath(jobId, "meta_config", "json"),
        Buffer.from(JSON.stringify({ model, tone, outputFormat, additionalContext: additionalContext || "" })),
      );

      const resumePath = getTempFilePath(jobId, "resume", format);
      const cvPath = getTempFilePath(jobId, "cv", format);
      const coverLetterPath = getTempFilePath(jobId, "cover_letter", format);
      const whyCompanyPath = getTempFilePath(jobId, "why_company", format);
      const linkedinMessagePath = getTempFilePath(jobId, "linkedin_message", format);

      writeTempFile(resumePath, resumeDoc);
      writeTempFile(cvPath, cvDoc);
      writeTempFile(coverLetterPath, coverLetterDoc);
      writeTempFile(whyCompanyPath, whyCompanyDoc);
      writeTempFile(linkedinMessagePath, linkedinMessageDoc);

      // Save raw markdown content for preview
      writeTempFile(
        getTempFilePath(jobId, "resume", "preview"),
        Buffer.from(resumeContent),
      );
      writeTempFile(
        getTempFilePath(jobId, "cv", "preview"),
        Buffer.from(cvContent),
      );
      writeTempFile(
        getTempFilePath(jobId, "cover_letter", "preview"),
        Buffer.from(coverLetterContent),
      );
      writeTempFile(
        getTempFilePath(jobId, "why_company", "preview"),
        Buffer.from(whyCompanyContent),
      );
      writeTempFile(
        getTempFilePath(jobId, "linkedin_message", "preview"),
        Buffer.from(linkedinMessageContent),
      );

      const data: GenerateResponse = {
        jobId,
        resumeDownloadUrl: `/api/download/${jobId}/resume`,
        cvDownloadUrl: `/api/download/${jobId}/cv`,
        coverLetterDownloadUrl: `/api/download/${jobId}/cover_letter`,
        whyCompanyDownloadUrl: `/api/download/${jobId}/why_company`,
        linkedinMessageDownloadUrl: `/api/download/${jobId}/linkedin_message`,
        outputFormat: format,
        atsScore,
      };

      sendSSE(res, { step: "complete", progress: 100, message: "Done!" });
      res.write(`data: ${JSON.stringify({ done: true, data })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const error = err as Error & { status?: number; code?: string };
      console.error("[Generate]", {
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack,
      });

      // If headers already sent (SSE mode), send error as event
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      } else {
        const status =
          error.status && error.status >= 400 && error.status < 600
            ? error.status
            : 500;
        res.status(status).json({
          error: "Failed to generate documents.",
          details: error.message,
        });
      }
    }
  },
);

export default router;
