import fs from "fs";
import path from "path";
import { config } from "../config";

export function ensureTempDir(jobId: string): string {
  const dir = path.join(config.TEMP_DIR, jobId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getTempFilePath(
  jobId: string,
  docType: string,
  format: string
): string {
  return path.join(config.TEMP_DIR, jobId, `${docType}.${format}`);
}

export function writeTempFile(filePath: string, data: Buffer): void {
  fs.writeFileSync(filePath, data);
}

export function readTempFile(filePath: string): Buffer | null {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

export function startCleanupScheduler(): void {
  const interval = Math.min(config.TEMP_FILE_TTL_MS, 5 * 60 * 1000);

  setInterval(() => {
    cleanupOldFiles();
  }, interval);

  console.log(
    `[Cleanup] Scheduler started. TTL: ${config.TEMP_FILE_TTL_MS}ms`
  );
}

function cleanupOldFiles(): void {
  const baseDir = config.TEMP_DIR;
  if (!fs.existsSync(baseDir)) return;

  const now = Date.now();
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirPath = path.join(baseDir, entry.name);
    const stat = fs.statSync(dirPath);

    if (now - stat.mtimeMs > config.TEMP_FILE_TTL_MS) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`[Cleanup] Removed expired directory: ${entry.name}`);
    }
  }
}
