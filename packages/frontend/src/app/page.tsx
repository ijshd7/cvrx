"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelSelector } from "@/components/model-selector";
import { JobInput } from "@/components/job-input";
import { ResumeUpload } from "@/components/resume-upload";
import { OutputFormatSelector } from "@/components/output-format-selector";
import { DownloadCard } from "@/components/download-card";
import { useGeneration } from "@/hooks/use-generation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { OutputFormat } from "@cvrx/shared";

export default function Home() {
  const [model, setModel] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("pdf");

  const { loading, error, result, generate, reset } = useGeneration();

  const canSubmit =
    model && (jobUrl || jobDescription) && resume && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Please upload your resume.");
      return;
    }

    if (!model) {
      toast.error("Please select a language model.");
      return;
    }

    if (!jobUrl && !jobDescription) {
      toast.error("Please provide a job URL or paste the job description.");
      return;
    }

    await generate({
      model,
      jobUrl,
      jobDescription,
      resume,
      outputFormat,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CVRX</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            AI-powered Resume &amp; CV Generator
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Tailored Documents</CardTitle>
              <CardDescription>
                Select a model, provide the job listing, upload your resume, and
                get an optimized resume and CV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ModelSelector value={model} onChange={setModel} />
              <JobInput
                url={jobUrl}
                description={jobDescription}
                onUrlChange={setJobUrl}
                onDescriptionChange={setJobDescription}
              />
              <ResumeUpload file={resume} onFileChange={setResume} />
              <OutputFormatSelector
                value={outputFormat}
                onChange={setOutputFormat}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!canSubmit}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Resume & CV"
                )}
              </Button>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </CardContent>
          </Card>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <DownloadCard result={result} />
            <div className="text-center">
              <Button variant="ghost" onClick={reset}>
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
