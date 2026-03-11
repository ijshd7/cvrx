export type OutputFormat = "pdf" | "docx";
export type DocType = "resume" | "cv" | "cover_letter" | "why_company";

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
  coverLetterDownloadUrl: string;
  whyCompanyDownloadUrl: string;
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
  | "generating_cover_letter"
  | "generating_why_company"
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
