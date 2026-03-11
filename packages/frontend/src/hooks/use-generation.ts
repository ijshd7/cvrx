"use client";

import { useState } from "react";
import { submitGeneration } from "@/lib/api";
import type {
  GenerateResponse,
  GenerateProgressEvent,
  GenerateStep,
  OutputFormat,
  ToneStyle,
} from "@cvrx/shared";

interface GenerationState {
  loading: boolean;
  error: string | null;
  result: GenerateResponse | null;
  progress: number;
  step: GenerateStep | null;
  stepMessage: string;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    result: null,
    progress: 0,
    step: null,
    stepMessage: "",
  });

  const generate = async (params: {
    model: string;
    jobUrl: string;
    jobDescription: string;
    resume: File;
    outputFormat: OutputFormat;
    tone: ToneStyle;
  }) => {
    setState({
      loading: true,
      error: null,
      result: null,
      progress: 0,
      step: null,
      stepMessage: "",
    });

    const formData = new FormData();
    formData.append("model", params.model);
    formData.append("outputFormat", params.outputFormat);
    formData.append("tone", params.tone);
    formData.append("resume", params.resume);

    if (params.jobUrl) {
      formData.append("jobUrl", params.jobUrl);
    }
    if (params.jobDescription) {
      formData.append("jobDescription", params.jobDescription);
    }

    await submitGeneration(formData, {
      onProgress: (event: GenerateProgressEvent) => {
        setState((prev) => ({
          ...prev,
          progress: event.progress,
          step: event.step,
          stepMessage: event.message,
        }));
      },
      onComplete: (data: GenerateResponse) => {
        setState({
          loading: false,
          error: null,
          result: data,
          progress: 100,
          step: "complete",
          stepMessage: "Done!",
        });
      },
      onError: (error: string) => {
        setState({
          loading: false,
          error,
          result: null,
          progress: 0,
          step: null,
          stepMessage: "",
        });
      },
    });
  };

  const reset = () => {
    setState({
      loading: false,
      error: null,
      result: null,
      progress: 0,
      step: null,
      stepMessage: "",
    });
  };

  return { ...state, generate, reset };
}
