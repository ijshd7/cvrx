"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <Label htmlFor="model">Language Model</Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="model" className="w-full">
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
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
