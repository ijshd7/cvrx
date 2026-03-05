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

export type GenerateStep =
  | "scraping"
  | "parsing"
  | "generating_resume"
  | "generating_cv"
  | "building_documents"
  | "complete";

export interface GenerateProgressEvent {
  step: GenerateStep;
  progress: number;
  message: string;
}

export interface GenerateCompleteEvent extends GenerateProgressEvent {
  step: "complete";
  data: GenerateResponse;
}

export type GenerateSSEEvent = GenerateProgressEvent | GenerateCompleteEvent;
