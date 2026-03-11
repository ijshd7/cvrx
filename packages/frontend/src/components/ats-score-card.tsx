"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AtsScoreResult } from "@cvrx/shared";

interface AtsScoreCardProps {
  score: AtsScoreResult;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getProgressColor(score: number): string {
  if (score >= 75) return "[&_[data-slot=progress-indicator]]:bg-green-500";
  if (score >= 50) return "[&_[data-slot=progress-indicator]]:bg-yellow-500";
  return "[&_[data-slot=progress-indicator]]:bg-red-500";
}

export function AtsScoreCard({ score }: AtsScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 rounded-lg border border-border/50 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">ATS Compatibility</p>
        <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
          {score.score}%
        </span>
      </div>

      <Progress
        value={score.score}
        className={`h-2 ${getProgressColor(score.score)}`}
      />

      {score.matchedKeywords.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Matched Keywords</p>
          <div className="flex flex-wrap gap-1">
            {score.matchedKeywords.slice(0, 12).map((kw) => (
              <Badge
                key={kw}
                variant="default"
                className="bg-green-500/15 text-green-600 hover:bg-green-500/25 text-xs"
              >
                {kw}
              </Badge>
            ))}
            {score.matchedKeywords.length > 12 && (
              <Badge variant="outline" className="text-xs">
                +{score.matchedKeywords.length - 12} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {score.missingKeywords.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Missing Keywords</p>
          <div className="flex flex-wrap gap-1">
            {score.missingKeywords.slice(0, 8).map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                {kw}
              </Badge>
            ))}
            {score.missingKeywords.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{score.missingKeywords.length - 8} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
