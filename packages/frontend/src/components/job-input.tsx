"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job Listing URL</Label>
        <Input
          id="jobUrl"
          type="url"
          placeholder="https://example.com/job-posting"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          We&apos;ll attempt to scrape the job description from this URL.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription">
          Job Description{" "}
          <span className="text-muted-foreground font-normal">
            (fallback if URL scraping fails, or use instead of URL)
          </span>
        </Label>
        <Textarea
          id="jobDescription"
          placeholder="Paste the job description here..."
          rows={6}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
