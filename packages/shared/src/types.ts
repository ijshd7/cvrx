export type OutputFormat = "pdf" | "docx";
export type DocType = "resume" | "cv";

export interface ModelInfo {
  id: string;
  name: string;
  context_length: number;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface GenerateResponse {
  jobId: string;
  resumeDownloadUrl: string;
  cvDownloadUrl: string;
  outputFormat: OutputFormat;
}

export interface ApiError {
  error: string;
  details?: string;
}
