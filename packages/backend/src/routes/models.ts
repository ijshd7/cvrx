import { Router, Request, Response } from "express";
import { fetchModels } from "../services/openrouter";

const router: ReturnType<typeof Router> = Router();

router.get("/models", async (_req: Request, res: Response) => {
  try {
    const models = await fetchModels();
    res.json({ models });
  } catch (err) {
    console.error("[Models]", err);
    res.status(502).json({ error: "Failed to fetch models from OpenRouter." });
  }
});

export default router;
