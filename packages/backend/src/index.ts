import express from "express";
import { config } from "./config";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { startCleanupScheduler } from "./utils/temp-files";
import modelsRouter from "./routes/models";
import generateRouter from "./routes/generate";
import downloadRouter from "./routes/download";
import previewRouter from "./routes/preview";
import regenerateRouter from "./routes/regenerate";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use("/api", modelsRouter);
app.use("/api", generateRouter);
app.use("/api", downloadRouter);
app.use("/api", previewRouter);
app.use("/api", regenerateRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

// Start cleanup scheduler
startCleanupScheduler();

const server = app.listen(config.PORT, () => {
  console.log(`[CVRX] Backend running on http://localhost:${config.PORT}`);
});

// Allow long-running LLM requests (5 minutes)
server.timeout = 300_000;
server.keepAliveTimeout = 300_000;
