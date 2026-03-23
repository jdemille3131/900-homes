"use client";

import { BookOpen, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StoryType } from "@/types/database";

interface StoryTypeSelectorProps {
  onSelect: (type: StoryType) => void;
}

const options: { type: StoryType; icon: typeof BookOpen; title: string; description: string }[] = [
  {
    type: "life_story",
    icon: BookOpen,
    title: "Life Story",
    description: "Share the big picture — your upbringing, your journey, the moments that shaped who you are.",
  },
  {
    type: "specific_event",
    icon: Zap,
    title: "A Specific Story",
    description: "Tell us about one meaningful event, memory, or moment that stuck with you.",
  },
];

export function StoryTypeSelector({ onSelect }: StoryTypeSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">What kind of story would you like to share?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Pick the one that feels right — you can always come back and share another.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <Card
            key={opt.type}
            className="cursor-pointer hover:nh-border hover:shadow-md transition-all"
            onClick={() => onSelect(opt.type)}
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
