"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import type { GenerateStep } from "@cvrx/shared";

const STEPS: { key: GenerateStep; label: string }[] = [
  { key: "scraping", label: "Fetching Job Listing" },
  { key: "parsing", label: "Parsing Resume" },
  { key: "generating_resume", label: "Writing Resume" },
  { key: "generating_cv", label: "Writing CV" },
  { key: "generating_cover_letter", label: "Writing Cover Letter" },
  { key: "generating_why_company", label: "Writing 'Why This Company?'" },
  { key: "generating_linkedin_message", label: "Writing LinkedIn Message" },
  { key: "scoring_ats", label: "Scoring ATS Compatibility" },
  { key: "building_documents", label: "Building Documents" },
  { key: "complete", label: "Complete" },
];

interface GenerationTimelineProps {
  currentStep: GenerateStep | null;
  stepMessage: string;
}

export function GenerationTimeline({
  currentStep,
  stepMessage,
}: GenerationTimelineProps) {
  const getStepStatus = (step: GenerateStep) => {
    if (!currentStep) return "pending";
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    const stepIndex = STEPS.findIndex((s) => s.key === step);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const status = getStepStatus(step.key);

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4"
          >
            {/* Circle indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                {status === "complete" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </motion.div>
                )}
                {status === "active" && (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                )}
                {status === "pending" && (
                  <Circle className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>

              {/* Vertical connecting line */}
              {index < STEPS.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-12 bg-border">
                  {status === "complete" && (
                    <motion.div
                      className="w-full bg-primary"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ originY: 0 }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Step label and message */}
            <div className="pt-1 flex-1 min-w-0">
              <p
                className={`font-medium text-sm ${
                  status === "active"
                    ? "text-primary"
                    : status === "complete"
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              {status === "active" && stepMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  {stepMessage}
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
