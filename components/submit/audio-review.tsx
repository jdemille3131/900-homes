"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MediaUploader, type UploadedMedia } from "@/components/media-uploader";
import { submitStory } from "@/app/actions/stories";
import { toast } from "sonner";
import { ArrowLeft, Play, SkipForward } from "lucide-react";
import type { Question, StoryType } from "@/types/database";

interface AudioReviewProps {
  storyType: StoryType;
  questions: Question[];
  recordings: Record<string, UploadedMedia>;
  storyId: string;
  defaultName: string;
  defaultEmail: string;
  onBack: () => void;
}

export function AudioReview({
  storyType,
  questions,
  recordings,
  storyId,
  defaultName,
  defaultEmail,
  onBack,
}: AudioReviewProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [extraMedia, setExtraMedia] = useState<UploadedMedia[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [hideAudio, setHideAudio] = useState(false);

  const handleExtraMedia = useCallback((media: UploadedMedia[]) => {
    setExtraMedia(media);
  }, []);

  // Build a text body summarizing which questions were answered via audio
  function buildBody(): string {
    const answeredQuestions = questions.filter((q) => recordings[q.id]);
    if (answeredQuestions.length === 0) return "";
    return answeredQuestions
      .map((q) => `**${q.question}**\n[Audio response]`)
      .join("\n\n");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    const recordingCount = Object.keys(recordings).length;
    if (recordingCount === 0) {
      toast.error("Please record at least one answer.");
      setSubmitting(false);
      return;
    }

    const body = buildBody();

    // Build media array: audio recordings (with question_id) + any extra uploads
    const audioMedia = Object.entries(recordings).map(([questionId, media]) => ({
      storage_path: media.storage_path,
      media_type: media.media_type,
      file_name: media.file_name,
      file_size: media.file_size,
      mime_type: media.mime_type,
      question_id: questionId,
    }));

    const otherMedia = extraMedia.map((m) => ({
      storage_path: m.storage_path,
      media_type: m.media_type,
      file_name: m.file_name,
      file_size: m.file_size,
      mime_type: m.mime_type,
    }));

    const result = await submitStory({
      contributor_name: formData.get("contributor_name") as string,
      contributor_email: formData.get("contributor_email") as string,
      title: formData.get("title") as string,
      body,
      neighbourhood: formData.get("neighbourhood") as string,
      story_type: storyType,
      submission_mode: "audio",
      hide_audio: hideAudio,
      answers: {},
      media: [...audioMedia, ...otherMedia],
    });

    if (result.error) {
      setErrors(result.error as Record<string, string[]>);
      toast.error("Please check the form for errors.");
      setSubmitting(false);
      return;
    }

    router.push("/submit/success");
  }

  const recordedCount = Object.keys(recordings).length;
  const skippedCount = questions.length - recordedCount;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Recording
      </Button>

      <h2 className="text-xl font-semibold mb-1">Review & Submit</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {recordedCount} answer{recordedCount !== 1 ? "s" : ""} recorded
        {skippedCount > 0 && `, ${skippedCount} skipped`}. Fill in your details below and submit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contributor info */}
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

        {/* Audio recordings summary */}
        <div className="space-y-3">
          <h3 className="font-semibold">Your Recordings</h3>
          {questions.map((q) => {
            const rec = recordings[q.id];
            return (
              <div key={q.id} className="border rounded-lg p-3 bg-muted/30">
                <p className="text-sm font-medium mb-2">{q.question}</p>
                {rec ? (
                  <audio src={rec.preview_url} controls className="w-full h-8" />
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <SkipForward className="h-3 w-3" />
                    Skipped
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Optional extra media */}
        <div className="space-y-3">
          <Label>Photos or Video (optional)</Label>
          <MediaUploader
            storyId={storyId}
            media={extraMedia}
            onMediaChange={handleExtraMedia}
          />
        </div>

        {errors._form && (
          <p className="text-sm text-destructive">{errors._form[0]}</p>
        )}

        <Separator />

        {/* Audio Privacy */}
        <div className="space-y-3">
          <h3 className="font-semibold">Audio Privacy</h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hideAudio}
              onChange={(e) => setHideAudio(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 nh-accent"
            />
            <div>
              <span className="text-sm font-medium">Keep my audio private</span>
              <p className="text-xs text-muted-foreground mt-1">
                Only the written transcript will be shared publicly. Your audio recordings will only be accessible to moderators.
              </p>
            </div>
          </label>
        </div>

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
