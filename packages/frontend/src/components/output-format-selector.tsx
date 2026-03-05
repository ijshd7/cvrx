"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OutputFormat } from "@cvrx/shared";

interface OutputFormatSelectorProps {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
}

export function OutputFormatSelector({
  value,
  onChange,
}: OutputFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Output Format</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as OutputFormat)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pdf" id="format-pdf" />
          <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
            PDF
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="docx" id="format-docx" />
          <Label htmlFor="format-docx" className="font-normal cursor-pointer">
            DOCX (Word)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
