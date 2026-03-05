import cors from "cors";

export const corsMiddleware = cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
});
