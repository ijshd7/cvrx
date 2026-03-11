"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Mail, MessageSquareText, Archive, CheckCircle2, Eye } from "lucide-react";
import type { GenerateResponse, DocType } from "@cvrx/shared";
import { getDownloadUrl, getAllDownloadUrl } from "@/lib/api";
import { AtsScoreCard } from "./ats-score-card";
import { DocumentPreview } from "./document-preview";

interface DownloadCardProps {
  result: GenerateResponse;
}

export function DownloadCard({ result }: DownloadCardProps) {
  const ext = result.outputFormat.toUpperCase();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocType, setPreviewDocType] = useState<DocType>("resume");

  const openPreview = (docType: DocType) => {
    setPreviewDocType(docType);
    setPreviewOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="animate-glow-pulse rounded-xl"
    >
      <Card className="w-full border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Documents Ready</CardTitle>
          <CardDescription>
            Your tailored application package is ready to download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AtsScoreCard score={result.atsScore} />

          <a
            href={getAllDownloadUrl(result.jobId, result.outputFormat)}
            download
            className="block"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <Archive className="h-5 w-5" />
              Download All ({ext})
            </motion.button>
          </a>

          <div className="border-t border-border/50 my-2" />

          <div className="flex gap-2">
            <a
              href={getDownloadUrl(result.resumeDownloadUrl)}
              download
              className="flex-1 block"
            >
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Resume</p>
                    <p className="text-xs text-muted-foreground">{ext}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                >
                  <Download className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => openPreview("resume")}
              className="px-3 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
            >
              <Eye className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <a
              href={getDownloadUrl(result.cvDownloadUrl)}
              download
              className="flex-1 block"
            >
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Curriculum Vitae</p>
                    <p className="text-xs text-muted-foreground">{ext}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                >
                  <Download className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => openPreview("cv")}
              className="px-3 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
            >
              <Eye className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <a
              href={getDownloadUrl(result.coverLetterDownloadUrl)}
              download
              className="flex-1 block"
            >
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Cover Letter</p>
                    <p className="text-xs text-muted-foreground">{ext}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                >
                  <Download className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => openPreview("cover_letter")}
              className="px-3 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
            >
              <Eye className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <a
              href={getDownloadUrl(result.whyCompanyDownloadUrl)}
              download
              className="flex-1 block"
            >
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Why This Company</p>
                    <p className="text-xs text-muted-foreground">{ext}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                >
                  <Download className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => openPreview("why_company")}
              className="px-3 py-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
            >
              <Eye className="h-5 w-5" />
            </motion.button>
          </div>

          <DocumentPreview
            jobId={result.jobId}
            initialDocType={previewDocType}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
