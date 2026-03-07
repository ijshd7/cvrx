"use client";

import { Globe, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JobInputProps {
  url: string;
  description: string;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function JobInput({
  url,
  description,
  onUrlChange,
  onDescriptionChange,
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
    </div>
  );
}
