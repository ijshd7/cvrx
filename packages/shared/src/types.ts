export type OutputFormat = "pdf" | "docx" | "txt" | "md";
export type DocType = "resume" | "cv" | "cover_letter" | "why_company";
export type ToneStyle =
  | "professional"
  | "conversational"
  | "confident"
  | "conservative";

export interface ModelInfo {
  id: string;
  name: string;
  context_length: number;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface AtsScoreResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
}

export interface GenerateResponse {
  jobId: string;
  resumeDownloadUrl: string;
  cvDownloadUrl: string;
  coverLetterDownloadUrl: string;
  whyCompanyDownloadUrl: string;
  outputFormat: OutputFormat;
  atsScore: AtsScoreResult;
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
  | "scoring_ats"
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
