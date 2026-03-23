"use client";

import { PenLine, Mic, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SubmissionMode } from "@/types/database";

interface SubmissionModeSelectorProps {
  onSelect: (mode: SubmissionMode) => void;
  onBack: () => void;
}

const options: { mode: SubmissionMode; icon: typeof PenLine; title: string; description: string }[] = [
  {
    mode: "text",
    icon: PenLine,
    title: "Write It",
    description: "Type your answers to guided questions at your own pace.",
  },
  {
    mode: "audio",
    icon: Mic,
    title: "Record It",
    description: "We'll walk you through each question and you record your answer one at a time.",
  },
];

export function SubmissionModeSelector({ onSelect, onBack }: SubmissionModeSelectorProps) {
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      <h2 className="text-xl font-semibold mb-1">How would you like to share?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Choose whichever feels most comfortable.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <Card
            key={opt.mode}
            className="cursor-pointer hover:nh-border hover:shadow-md transition-all"
            onClick={() => onSelect(opt.mode)}
          >
            <CardContent className="py-8 flex flex-col items-center text-center gap-3">
              <opt.icon className="h-10 w-10 nh-text" />
              <h3 className="text-lg font-semibold">{opt.title}</h3>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
