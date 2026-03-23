"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StoryBody } from "@/components/story-body";
import { updateStoryFields } from "@/app/actions/stories";
import { toast } from "sonner";
import { Pencil, Check, X, Download, AlertTriangle } from "lucide-react";

export interface AudioContextItem {
  question: string;
  audioUrl: string;
  fileName: string;
}

interface StoryEditorProps {
  storyId: string;
  initialTitle: string;
  initialContributorName: string;
  initialBody: string;
  audioContext?: AudioContextItem[];
}

/**
 * Parse the body to extract answers keyed by question text.
 * Body format: **Question?**\nAnswer\n\n**Question2?**\nAnswer2
 */
function parseAnswersByQuestion(body: string): Record<string, string> {
  const map: Record<string, string> = {};
  const sections = body.split(/\n\n/).filter(Boolean);
  for (const section of sections) {
    const match = section.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);
    if (match) {
      const q = match[1].trim();
      const a = match[2].trim();
      map[q] = a;
    }
  }
  return map;
}

function hasPlaceholders(body: string): boolean {
  return body.includes("[Audio response]");
}

export function StoryEditor({
  storyId,
  initialTitle,
  initialContributorName,
  initialBody,
  audioContext,
}: StoryEditorProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [contributorName, setContributorName] = useState(initialContributorName);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const isAudioStory = !!audioContext && audioContext.length > 0;
  const needsTranscript = isAudioStory && hasPlaceholders(body);

  // For audio stories: one answer per audioContext entry, keyed by question text
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (!audioContext) return {};
    const existing = parseAnswersByQuestion(initialBody);
    const result: Record<string, string> = {};
    for (const item of audioContext) {
      const existingAnswer = existing[item.question];
      result[item.question] = existingAnswer && existingAnswer !== "[Audio response]"
        ? existingAnswer
        : "";
    }
    return result;
  });

  function updateAnswer(question: string, value: string) {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  }

  function buildAudioBody(): string {
    if (!audioContext) return body;
    return audioContext
      .map((item) => {
        const answer = answers[item.question]?.trim() || "[Audio response]";
        return `**${item.question}**\n${answer}`;
      })
      .join("\n\n");
  }

  async function handleSave() {
    setSaving(true);

    const finalBody = isAudioStory ? buildAudioBody() : body;

    const result = await updateStoryFields(storyId, {
      title,
      contributor_name: contributorName,
      body: finalBody,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Story updated.");
      setBody(finalBody);
      setEditing(false);
    }
    setSaving(false);
  }

  function handleCancel() {
    setTitle(initialTitle);
    setContributorName(initialContributorName);
    setBody(initialBody);
    // Reset answers from initial body
    if (audioContext) {
      const existing = parseAnswersByQuestion(initialBody);
      const result: Record<string, string> = {};
      for (const item of audioContext) {
        const existingAnswer = existing[item.question];
        result[item.question] = existingAnswer && existingAnswer !== "[Audio response]"
          ? existingAnswer
          : "";
      }
      setAnswers(result);
    }
    setEditing(false);
  }

  function handleStartEdit() {
    // Re-parse answers from current body when entering edit mode
    if (audioContext) {
      const existing = parseAnswersByQuestion(body);
      const result: Record<string, string> = {};
      for (const item of audioContext) {
        const existingAnswer = existing[item.question];
        result[item.question] = existingAnswer && existingAnswer !== "[Audio response]"
          ? existingAnswer
          : "";
      }
      setAnswers(result);
    }
    setEditing(true);
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">by {contributorName}</p>
          </div>
          <div className="flex items-center gap-2">
            {needsTranscript && (
              <Badge variant="secondary" className="text-amber-700 bg-amber-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Needs Transcript
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Non-editing view for audio stories: show each question with audio + transcript */}
        {isAudioStory && (
          <div className="space-y-4 mb-6">
            {audioContext.map((item, i) => {
              const existingAnswers = parseAnswersByQuestion(body);
              const answer = existingAnswers[item.question];
              return (
                <div key={i} className="border-l-2 border-amber-200 pl-5">
                  <p className="text-sm italic text-amber-700 mb-2">
                    {item.question}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <audio
                      src={item.audioUrl}
                      controls
                      preload="metadata"
                      className="flex-1 h-8"
                    />
                    <a
                      href={item.audioUrl}
                      download={item.fileName}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>
                  <div className="text-lg leading-relaxed">
                    {!answer || answer === "[Audio response]" ? (
                      <p className="text-muted-foreground italic text-sm">No transcript yet</p>
                    ) : (
                      answer.split("\n").map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-3" : undefined}>
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* For non-audio stories, show the body normally */}
        {!isAudioStory && <StoryBody body={body} />}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Editing Story</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Contributor Name</Label>
        <Input value={contributorName} onChange={(e) => setContributorName(e.target.value)} />
      </div>

      {/* Audio stories: per-question editing driven by audioContext */}
      {isAudioStory ? (
        <div className="space-y-6">
          <div>
            <Label>Story Transcript</Label>
            <p className="text-xs text-muted-foreground">
              Listen to each recording and type the transcript below.
            </p>
          </div>
          {audioContext.map((item, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-background">
              <p className="font-medium text-sm">{item.question}</p>
              <div className="flex items-center gap-2">
                <audio
                  src={item.audioUrl}
                  controls
                  preload="metadata"
                  className="flex-1 h-8"
                />
                <a
                  href={item.audioUrl}
                  download={item.fileName}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
              <Textarea
                value={answers[item.question] ?? ""}
                onChange={(e) => updateAnswer(item.question, e.target.value)}
                placeholder="Type the transcript here..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <Label>Story Body</Label>
          <p className="text-xs text-muted-foreground">
            Use **Question?** on its own line followed by the answer on the next line for Q&A formatting.
          </p>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
