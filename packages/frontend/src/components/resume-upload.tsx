"use client";

import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ".pdf,.docx,.txt";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function ResumeUpload({ file, onFileChange }: ResumeUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (ACCEPTED_TYPES.includes(f.type) || f.name.match(/\.(pdf|docx|txt)$/i)) {
        onFileChange(f);
      }
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <Label>Resume Upload</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          file && "border-primary/50 bg-primary/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
            <button
              type="button"
              className="ml-2 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your resume, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, or TXT (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
