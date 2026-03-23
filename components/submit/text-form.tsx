"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MediaUploader, type UploadedMedia } from "@/components/media-uploader";
import { AudioRecorder } from "@/components/audio-recorder";
import { submitStory } from "@/app/actions/stories";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { Question, StoryType } from "@/types/database";

interface TextFormProps {
  storyType: StoryType;
  questions: Question[];
  storyId: string;
  defaultName: string;
  defaultEmail: string;
  onBack: () => void;
}

export function TextForm({
  storyType,
  questions,
  storyId,
  defaultName,
  defaultEmail,
  onBack,
}: TextFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(false);

  const handleRecorded = useCallback((recorded: UploadedMedia) => {
    setMedia((prev) => [...prev, recorded]);
  }, []);

  function updateAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function buildBody(): string {
    return questions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => `**${q.question}**\n${answers[q.id].trim()}`)
      .join("\n\n");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const body = buildBody();

    if (!body) {
      setErrors({ body: ["Please answer at least one question."] });
      toast.error("Please answer at least one question.");
      setSubmitting(false);
      return;
    }

    const result = await submitStory({
      contributor_name: formData.get("contributor_name") as string,
      contributor_email: formData.get("contributor_email") as string,
      title: formData.get("title") as string,
      body,
      neighbourhood: formData.get("neighbourhood") as string,
      story_type: storyType,
      submission_mode: "text",
      answers,
      media: media.map((m) => ({
        storage_path: m.storage_path,
        media_type: m.media_type,
        file_name: m.file_name,
        file_size: m.file_size,
        mime_type: m.mime_type,
      })),
    });

    if (result.error) {
      setErrors(result.error as Record<string, string[]>);
      toast.error("Please check the form for errors.");
      setSubmitting(false);
      return;
    }

    router.push("/submit/success");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* About you */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contributor_name">Your Name *</Label>
            <Input
              id="contributor_name"
              name="contributor_name"
              placeholder="How you'd like to be credited"
              defaultValue={defaultName}
              required
            />
            {errors.contributor_name && (
              <p className="text-sm text-destructive">{errors.contributor_name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contributor_email">Email *</Label>
            <Input
              id="contributor_email"
              name="contributor_email"
              type="email"
              placeholder="your@email.com"
              defaultValue={defaultEmail}
              required
            />
            <p className="text-xs text-muted-foreground">
              Never shared publicly. Used only for verification and follow-up questions about your story.
            </p>
            {errors.contributor_email && (
              <p className="text-sm text-destructive">{errors.contributor_email[0]}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighbourhood">Neighborhood *</Label>
            <Input
              id="neighbourhood"
              name="neighbourhood"
              defaultValue="Raintree Village"
              required
            />
            {errors.neighbourhood && (
              <p className="text-sm text-destructive">{errors.neighbourhood[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Give your story a title"
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Guided questions */}
        {questions.length > 0 && (() => {
          const coreQuestions = questions.filter((q) => q.is_required);
          const optionalQuestions = questions.filter((q) => !q.is_required);
          let questionNumber = 0;

          return (
            <div className="space-y-6">
              {coreQuestions.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Your Story</h2>
                    <p className="text-sm text-muted-foreground">
                      Answer the questions that speak to you. Skip any that don&apos;t.
                    </p>
                  </div>

                  {coreQuestions.map((q) => {
                    questionNumber++;
                    return (
                      <div key={q.id} className="space-y-2">
                        <Label htmlFor={`q-${q.id}`} className="text-base">
                          <span className="text-muted-foreground mr-2">{questionNumber}.</span>
                          {q.question}
                        </Label>
                        {q.hint && (
                          <p className="text-xs text-muted-foreground">{q.hint}</p>
                        )}
                        <Textarea
                          id={`q-${q.id}`}
                          value={answers[q.id] || ""}
                          onChange={(e) => updateAnswer(q.id, e.target.value)}
                          placeholder="Your answer..."
                          rows={3}
                        />
                      </div>
                    );
                  })}
                </>
              )}

              {optionalQuestions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Optional Questions</h2>
                    <p className="text-sm text-muted-foreground">
                      These are totally optional — but they help paint a fuller picture.
                    </p>
                  </div>

                  {optionalQuestions.map((q) => {
                    questionNumber++;
                    return (
                      <div key={q.id} className="space-y-2">
                        <Label htmlFor={`q-${q.id}`} className="text-base">
                          <span className="text-muted-foreground mr-2">{questionNumber}.</span>
                          {q.question}
                        </Label>
                        {q.hint && (
                          <p className="text-xs text-muted-foreground">{q.hint}</p>
                        )}
                        <Textarea
                          id={`q-${q.id}`}
                          value={answers[q.id] || ""}
                          onChange={(e) => updateAnswer(q.id, e.target.value)}
                          placeholder="Your answer..."
                          rows={3}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })()}

        {errors.body && (
          <p className="text-sm text-destructive">{errors.body[0]}</p>
        )}

        <Separator />

        {/* Media */}
        <div className="space-y-3">
          <Label>Photos, Audio, or Video (optional)</Label>
          <MediaUploader
            storyId={storyId}
            media={media}
            onMediaChange={setMedia}
          />
          <AudioRecorder storyId={storyId} onRecorded={handleRecorded} />
        </div>

        {errors._form && (
          <p className="text-sm text-destructive">{errors._form[0]}</p>
        )}

        <Separator />

        {/* Consent & Release */}
        <div className="space-y-3">
          <h3 className="font-semibold">Consent &amp; Release</h3>
          <p className="text-sm text-muted-foreground">
            By submitting my story, I give permission for it to be recorded, edited, and shared
            as part of the 900 Homes project, including on websites and social media.
          </p>
          <p className="text-sm text-muted-foreground">
            I understand I can choose to remain anonymous and may request my story be removed at any time.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 nh-accent"
              required
            />
            <span className="text-sm font-medium">I agree</span>
          </label>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || !consentGiven}
          className="w-full nh-bg nh-bg-hover"
        >
          {submitting ? "Submitting..." : "Submit Story"}
        </Button>
      </form>
    </div>
  );
}
