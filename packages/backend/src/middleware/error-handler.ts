import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err.message);

  if (err.message.includes("Invalid file type")) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes("File too large")) {
    res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    details:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
