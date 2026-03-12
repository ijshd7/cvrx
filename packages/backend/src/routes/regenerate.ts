import { Router, Request, Response } from "express";
import { z } from "zod";
import type { OutputFormat, ToneStyle, DocType } from "@cvrx/shared";
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
import { getTempFilePath, readTempFile, writeTempFile } from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const regenerateSchema = z.object({
  jobId: z.string().uuid(),
  docType: z.enum([
    "resume",
    "cv",
    "cover_letter",
    "why_company",
    "linkedin_message",
  ]),
});

const DOC_TITLES: Record<DocType, string> = {
  resume: "Resume",
  cv: "Curriculum Vitae",
  cover_letter: "Cover Letter",
  why_company: "Why This Company",
  linkedin_message: "LinkedIn Message",
};

function getPromptBuilder(docType: DocType) {
  switch (docType) {
    case "resume":
      return buildResumePrompt;
    case "cv":
      return buildCvPrompt;
    case "cover_letter":
      return buildCoverLetterPrompt;
    case "why_company":
      return buildWhyCompanyPrompt;
    case "linkedin_message":
      return buildLinkedInMessagePrompt;
  }
}

router.post("/regenerate", async (req: Request, res: Response) => {
  try {
    const parsed = regenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
      return;
    }

    const { jobId, docType } = parsed.data;

    // Read saved metadata
    const resumeTextBuf = readTempFile(getTempFilePath(jobId, "meta_resume", "txt"));
    const jdBuf = readTempFile(getTempFilePath(jobId, "meta_jd", "txt"));
    const configBuf = readTempFile(getTempFilePath(jobId, "meta_config", "json"));

    if (!resumeTextBuf || !jdBuf || !configBuf) {
      res.status(404).json({ error: "Job data not found or expired. Please generate documents again." });
      return;
    }

    const resumeText = resumeTextBuf.toString("utf-8");
    const jobDescription = jdBuf.toString("utf-8");
    const config = JSON.parse(configBuf.toString("utf-8"));

    const model = config.model as string;
    const tone = config.tone as ToneStyle;
    const outputFormat = config.outputFormat as OutputFormat;
    const additionalContext = config.additionalContext as string | undefined;

    // Build prompt for the specific doc type
    const buildPrompt = getPromptBuilder(docType);
    const prompt = buildPrompt(resumeText, jobDescription, tone, additionalContext);

    // Generate content
    const rawContent = await generateContent(model, prompt.system, prompt.user);
    const content = sanitizeGeneratedContent(rawContent);

    // Generate formatted document
    const docBuffer = await generateDocument(content, outputFormat, DOC_TITLES[docType]);

    // Overwrite existing files
    writeTempFile(getTempFilePath(jobId, docType, outputFormat), docBuffer);
    writeTempFile(getTempFilePath(jobId, docType, "preview"), Buffer.from(content));

    res.json({ content, docType });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("[Regenerate]", error.message);

    const status =
      error.status && error.status >= 400 && error.status < 600
        ? error.status
        : 500;
    res.status(status).json({
      error: "Failed to regenerate document.",
      details: error.message,
    });
  }
});

export default router;
