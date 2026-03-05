"use client";

import { useState } from "react";
import { submitGeneration } from "@/lib/api";
import type { GenerateResponse, OutputFormat } from "@cvrx/shared";

interface GenerationState {
  loading: boolean;
  error: string | null;
  result: GenerateResponse | null;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    result: null,
  });

  const generate = async (params: {
    model: string;
    jobUrl: string;
    jobDescription: string;
    resume: File;
    outputFormat: OutputFormat;
  }) => {
    setState({ loading: true, error: null, result: null });

    try {
      const formData = new FormData();
      formData.append("model", params.model);
      formData.append("outputFormat", params.outputFormat);
      formData.append("resume", params.resume);

      if (params.jobUrl) {
        formData.append("jobUrl", params.jobUrl);
      }
      if (params.jobDescription) {
        formData.append("jobDescription", params.jobDescription);
      }

      const result = await submitGeneration(formData);
      setState({ loading: false, error: null, result });
    } catch (err) {
      setState({
        loading: false,
        error: (err as Error).message,
        result: null,
      });
    }
  };

  const reset = () => {
    setState({ loading: false, error: null, result: null });
  };

  return { ...state, generate, reset };
}
