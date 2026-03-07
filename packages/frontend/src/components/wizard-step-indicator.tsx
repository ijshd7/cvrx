"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

export interface WizardStep {
  label: string;
  icon: ReactNode;
}

interface WizardStepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
}

export function WizardStepIndicator({
  steps,
  currentStep,
}: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <motion.div
              className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive || isComplete
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
              initial={false}
            >
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="number"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="font-semibold text-sm"
                  >
                    {index + 1}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Pulsing ring for active step */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  style={{ opacity: 0.3 }}
                />
              )}
            </motion.div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-border mx-2 relative overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ originX: 0 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
