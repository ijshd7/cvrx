"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ToneSelector } from "@/components/tone-selector";
import { DownloadCard } from "@/components/download-card";
import { WizardStepIndicator } from "@/components/wizard-step-indicator";
import { GenerationTimeline } from "@/components/generation-timeline";
import { useGeneration } from "@/hooks/use-generation";
import { toast } from "sonner";
import type { OutputFormat, ToneStyle } from "@cvrx/shared";
import { Bot, Briefcase, FileUp, FileOutput, CheckCircle2 } from "lucide-react";

const WIZARD_STEPS = [
  { label: "AI Model", icon: <Bot className="w-5 h-5" /> },
  { label: "Job Info", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Resume", icon: <FileUp className="w-5 h-5" /> },
  { label: "Format", icon: <FileOutput className="w-5 h-5" /> },
];

export default function Home() {
  const [wizardStep, setWizardStep] = useState(0);
  const [model, setModel] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("pdf");
  const [tone, setTone] = useState<ToneStyle>("professional");

  const {
    loading,
    error,
    result,
    progress: _progress,
    step,
    stepMessage,
    generate,
    reset,
  } = useGeneration();

  const canSubmit = model && (jobUrl || jobDescription) && resume && !loading;

  const canAdvance = (stepIndex: number): boolean => {
    if (stepIndex === 0) return model !== "";
    if (stepIndex === 1) return jobUrl !== "" || jobDescription !== "";
    if (stepIndex === 2) return resume !== null;
    return true;
  };

  const handleNext = () => {
    if (canAdvance(wizardStep)) {
      setWizardStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setWizardStep((s) => s - 1);
  };

  const handleSubmit = async () => {
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
      additionalContext,
      resume,
      outputFormat,
      tone,
    });
  };

  const handleReset = () => {
    reset();
    setWizardStep(0);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Decorative background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.21_264/0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative container mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            CVR<span className="text-primary">X</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            AI-powered Resume, CV & Cover Letter Generator
          </p>
        </motion.div>

        {/* Wizard view - shown when not generating and no result */}
        {!loading && !result && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <WizardStepIndicator
                steps={WIZARD_STEPS}
                currentStep={wizardStep}
              />
            </motion.div>

            {/* Animated step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={wizardStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Card className="mt-8 border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    {wizardStep === 0 && (
                      <ModelSelector value={model} onChange={setModel} />
                    )}
                    {wizardStep === 1 && (
                      <JobInput
                        url={jobUrl}
                        description={jobDescription}
                        additionalContext={additionalContext}
                        onUrlChange={setJobUrl}
                        onDescriptionChange={setJobDescription}
                        onAdditionalContextChange={setAdditionalContext}
                      />
                    )}
                    {wizardStep === 2 && (
                      <ResumeUpload file={resume} onFileChange={setResume} />
                    )}
                    {wizardStep === 3 && (
                      <div className="space-y-8">
                        <OutputFormatSelector
                          value={outputFormat}
                          onChange={setOutputFormat}
                        />
                        <ToneSelector value={tone} onChange={setTone} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between gap-3">
              {wizardStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <div className="ml-auto">
                {wizardStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canAdvance(wizardStep)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Generate Documents
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Generation in progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mt-8 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Generating your documents...</CardTitle>
                <CardDescription>
                  Sit back while we craft your perfect application materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerationTimeline
                  currentStep={step}
                  stepMessage={stepMessage}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mt-8 border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive text-sm mb-4">{error}</p>
                <Button onClick={handleReset} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Result view */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <DownloadCard result={result} />
            <div className="text-center mt-6">
              <Button variant="ghost" onClick={handleReset}>
                Generate Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
