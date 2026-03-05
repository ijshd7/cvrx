import type { ModelsResponse, GenerateResponse } from "@cvrx/shared";

const API_BASE = "/api";

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) {
    throw new Error("Failed to fetch models");
  }
  return res.json();
}

export async function submitGeneration(formData: FormData): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    const message = error.details
      ? `${error.error}: ${error.details}`
      : error.error || "Failed to generate documents";
    throw new Error(message);
  }

  return res.json();
}

export function getDownloadUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/api") ? path.replace("/api", "") : path}`;
}
