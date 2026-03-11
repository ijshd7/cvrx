"use client";

import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, FileOutput, FileType, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OutputFormat } from "@cvrx/shared";

interface OutputFormatSelectorProps {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
}

const formats = [
  {
    value: "pdf" as OutputFormat,
    label: "PDF",
    sublabel: "Universal, print-ready",
    icon: <FileText className="h-8 w-8" />,
  },
  {
    value: "docx" as OutputFormat,
    label: "Word Document",
    sublabel: "Editable, recruiter-friendly",
    icon: <FileSpreadsheet className="h-8 w-8" />,
  },
  {
    value: "txt" as OutputFormat,
    label: "Plain Text",
    sublabel: "Simple, lightweight",
    icon: <FileType className="h-8 w-8" />,
  },
  {
    value: "md" as OutputFormat,
    label: "Markdown",
    sublabel: "Developer-friendly",
    icon: <Code className="h-8 w-8" />,
  },
];

export function OutputFormatSelector({
  value,
  onChange,
}: OutputFormatSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileOutput className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">Output Format</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose how you&apos;d like to download your documents.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {formats.map((fmt) => (
          <motion.button
            key={fmt.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(fmt.value)}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center cursor-pointer transition-colors",
              value === fmt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground",
            )}
          >
            {value === fmt.value && (
              <motion.div
                layoutId="format-selected-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
              />
            )}
            <div className="relative z-10">
              {fmt.icon}
              <div className="mt-2 font-semibold text-sm">{fmt.label}</div>
              <div className="text-xs mt-1 text-muted-foreground/75">
                {fmt.sublabel}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
