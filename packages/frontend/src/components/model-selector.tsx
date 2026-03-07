"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchModels } from "@/lib/api";
import type { ModelInfo } from "@cvrx/shared";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels()
      .then((data) => {
        setModels(data.models);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">Select AI Model</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose the AI model that will generate your documents.
      </p>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="model" className="w-full bg-input border-border">
          <SelectValue
            placeholder={
              loading
                ? "Loading models..."
                : error
                  ? "Failed to load models"
                  : "Select a model"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
