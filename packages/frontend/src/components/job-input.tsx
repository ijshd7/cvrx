"use client";

import { Globe, Briefcase, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JobInputProps {
  url: string;
  description: string;
  additionalContext: string;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAdditionalContextChange: (value: string) => void;
}

export function JobInput({
  url,
  description,
  additionalContext,
  onUrlChange,
  onDescriptionChange,
  onAdditionalContextChange,
}: JobInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">Job Information</h2>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="jobUrl"
            type="url"
            placeholder="https://example.com/job-posting"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="pl-10 bg-input border-border placeholder:text-muted-foreground/50"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a job listing URL and we&apos;ll scrape the description.
        </p>
      </div>

      <div className="relative flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          or paste directly
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-3">
        <Textarea
          id="jobDescription"
          placeholder="Paste the job description here..."
          rows={5}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="bg-input border-border placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          Or paste the full job description directly instead of a URL.
        </p>
      </div>

      <div className="border-t border-border/50 mt-6 pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Additional Context{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </span>
        </div>
        <Textarea
          id="additionalContext"
          placeholder="e.g., &quot;Highlight my Python experience&quot; or &quot;I'm transitioning from finance to tech&quot;"
          rows={3}
          value={additionalContext}
          onChange={(e) => onAdditionalContextChange(e.target.value)}
          className="bg-input border-border placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          Guide the AI on what to emphasize across all generated documents.
        </p>
      </div>
    </div>
  );
}
