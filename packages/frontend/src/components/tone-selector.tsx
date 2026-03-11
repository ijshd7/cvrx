"use client";

import { motion } from "framer-motion";
import { Briefcase, MessageCircle, Zap, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToneStyle } from "@cvrx/shared";

interface ToneSelectorProps {
  value: ToneStyle;
  onChange: (value: ToneStyle) => void;
}

const tones = [
  {
    value: "professional" as ToneStyle,
    label: "Professional",
    sublabel: "Polished and clear",
    icon: <Briefcase className="h-8 w-8" />,
  },
  {
    value: "conversational" as ToneStyle,
    label: "Conversational",
    sublabel: "Warm and approachable",
    icon: <MessageCircle className="h-8 w-8" />,
  },
  {
    value: "confident" as ToneStyle,
    label: "Confident",
    sublabel: "Direct and assertive",
    icon: <Zap className="h-8 w-8" />,
  },
  {
    value: "conservative" as ToneStyle,
    label: "Conservative",
    sublabel: "Formal and traditional",
    icon: <Shield className="h-8 w-8" />,
  },
];

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">Writing Tone</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose the tone for your generated documents.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {tones.map((t) => (
          <motion.button
            key={t.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center cursor-pointer transition-colors",
              value === t.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground",
            )}
          >
            {value === t.value && (
              <motion.div
                layoutId="tone-selected-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
              />
            )}
            <div className="relative z-10">
              {t.icon}
              <div className="mt-2 font-semibold text-sm">{t.label}</div>
              <div className="text-xs mt-1 text-muted-foreground/75">
                {t.sublabel}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
