import type {
  ModelsResponse,
  GenerateResponse,
  GenerateProgressEvent,
} from "@cvrx/shared";

const API_BASE = "/api";
// SSE streams can't go through Next.js rewrite proxy (it buffers the full response).
// Hit the backend directly for streaming endpoints.
const STREAM_API_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "") + "/api";

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) {
    throw new Error("Failed to fetch models");
  }
  return res.json();
}

export interface SSECallbacks {
  onProgress: (event: GenerateProgressEvent) => void;
  onComplete: (data: GenerateResponse) => void;
  onError: (error: string) => void;
}

export async function submitGeneration(
  formData: FormData,
  callbacks: SSECallbacks,
): Promise<void> {
  const res = await fetch(`${STREAM_API_BASE}/generate`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    // Non-SSE error (validation errors return JSON before SSE starts)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      const message = error.details
        ? `${error.error}: ${error.details}`
        : error.error || "Failed to generate documents";
      callbacks.onError(message);
      return;
    }
    callbacks.onError("Request failed");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError("Streaming not supported");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const parsed = JSON.parse(jsonStr);

        if (parsed.error) {
          callbacks.onError(parsed.error);
          return;
        }

        if (parsed.done && parsed.data) {
          callbacks.onComplete(parsed.data as GenerateResponse);
          return;
        }

        if (parsed.step) {
          callbacks.onProgress(parsed as GenerateProgressEvent);
        }
      } catch {
        // skip malformed JSON
      }
    }
  }
}

export function getDownloadUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/api") ? path.replace("/api", "") : path}`;
}

export function getAllDownloadUrl(jobId: string, format: string): string {
  return `${API_BASE}/download/${jobId}/all?format=${format}`;
}

export async function fetchPreview(
  jobId: string,
  docType: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/preview/${jobId}/${docType}`);
  if (!res.ok) {
    throw new Error("Failed to fetch preview");
  }
  const data = (await res.json()) as { content: string };
  return data.content;
}
