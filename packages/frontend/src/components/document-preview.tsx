"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPreview } from "@/lib/api";
import type { DocType } from "@cvrx/shared";

interface DocumentPreviewProps {
  jobId: string;
  initialDocType: DocType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DOC_NAMES: Record<DocType, string> = {
  resume: "Resume",
  cv: "Curriculum Vitae",
  cover_letter: "Cover Letter",
  why_company: "Why This Company",
};

const DOC_TABS: { docType: DocType; label: string }[] = [
  { docType: "resume", label: "Resume" },
  { docType: "cv", label: "CV" },
  { docType: "cover_letter", label: "Cover Letter" },
  { docType: "why_company", label: "Why This Company" },
];

export function DocumentPreview({
  jobId,
  initialDocType,
  open,
  onOpenChange,
}: DocumentPreviewProps) {
  const [currentDocType, setCurrentDocType] = useState<DocType>(initialDocType);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadPreview = async () => {
      setLoading(true);
      try {
        const previewContent = await fetchPreview(jobId, currentDocType);
        setContent(previewContent);
      } catch (err) {
        const error = err as Error;
        setContent(`Error loading preview: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [jobId, currentDocType, open]);

  const handleTabChange = (docType: string) => {
    setCurrentDocType(docType as DocType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
          <DialogDescription>
            Preview {DOC_NAMES[currentDocType]} before downloading
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={currentDocType}
          onValueChange={handleTabChange}
          className="w-full flex flex-col flex-1 min-h-0"
        >
          <TabsList className="grid w-full grid-cols-4">
            {DOC_TABS.map((tab) => (
              <TabsTrigger key={tab.docType} value={tab.docType}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DOC_TABS.map((tab) => (
            <TabsContent
              key={tab.docType}
              value={tab.docType}
              className="flex-1 overflow-y-auto min-h-0"
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-32"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose dark:prose-invert prose-sm max-w-none p-4 bg-muted/30 rounded-lg overflow-y-auto"
                >
                  <ReactMarkdown>{content}</ReactMarkdown>
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
