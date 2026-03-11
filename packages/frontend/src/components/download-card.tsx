"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Mail, MessageSquareText, CheckCircle2 } from "lucide-react";
import type { GenerateResponse } from "@cvrx/shared";
import { getDownloadUrl } from "@/lib/api";

interface DownloadCardProps {
  result: GenerateResponse;
}

export function DownloadCard({ result }: DownloadCardProps) {
  const ext = result.outputFormat.toUpperCase();

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
        <CardContent className="space-y-3">
          <a
            href={getDownloadUrl(result.resumeDownloadUrl)}
            download
            className="block"
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

          <a
            href={getDownloadUrl(result.cvDownloadUrl)}
            download
            className="block"
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

          <a
            href={getDownloadUrl(result.coverLetterDownloadUrl)}
            download
            className="block"
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

          <a
            href={getDownloadUrl(result.whyCompanyDownloadUrl)}
            download
            className="block"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
