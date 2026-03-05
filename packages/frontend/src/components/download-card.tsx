"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen } from "lucide-react";
import type { GenerateResponse } from "@cvrx/shared";
import { getDownloadUrl } from "@/lib/api";

interface DownloadCardProps {
  result: GenerateResponse;
}

export function DownloadCard({ result }: DownloadCardProps) {
  const ext = result.outputFormat.toUpperCase();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Documents Are Ready</CardTitle>
        <CardDescription>
          Download your tailored resume and CV below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <a
          href={getDownloadUrl(result.resumeDownloadUrl)}
          download
          className="flex-1"
        >
          <Button variant="default" className="w-full gap-2" size="lg">
            <FileText className="h-5 w-5" />
            <span>Resume ({ext})</span>
            <Download className="h-4 w-4" />
          </Button>
        </a>
        <a
          href={getDownloadUrl(result.cvDownloadUrl)}
          download
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2" size="lg">
            <BookOpen className="h-5 w-5" />
            <span>CV ({ext})</span>
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
