import { Router, Request, Response } from "express";
import { z } from "zod";
import { getTempFilePath, readTempFile } from "../utils/temp-files";

const router: ReturnType<typeof Router> = Router();

const paramsSchema = z.object({
  jobId: z.string().uuid(),
  docType: z.enum(["resume", "cv", "cover_letter", "why_company"]),
});

router.get("/preview/:jobId/:docType", (req: Request, res: Response) => {
  const paramsParsed = paramsSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid preview parameters." });
    return;
  }

  const { jobId, docType } = paramsParsed.data;

  try {
    const filePath = getTempFilePath(jobId, docType, "preview");
    const data = readTempFile(filePath);

    if (!data) {
      res.status(404).json({ error: "Preview not found or expired." });
      return;
    }

    const content = data.toString("utf-8");
    res.json({ content });
  } catch (err) {
    const error = err as Error;
    console.error("[Preview]", error.message);
    res.status(500).json({ error: "Failed to read preview." });
  }
});

export default router;
