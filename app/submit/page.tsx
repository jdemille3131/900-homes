"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MediaUploader, type UploadedMedia } from "@/components/media-uploader";
import { AudioRecorder } from "@/components/audio-recorder";
import { submitStory } from "@/app/actions/stories";
import { toast } from "sonner";
import Link from "next/link";
import type { Question } from "@/types/database";

export default function SubmitPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [storyId] = useState(() => crypto.randomUUID());
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [defaultName, setDefaultName] = useState("");
  const [defaultEmail, setDefaultEmail] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        setDefaultEmail(user.email || "");
        setDefaultName(user.user_metadata?.display_name || "");
      }
    });

    // Fetch active questions
    supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setQuestions(data as Question[]);
      });
  }, []);

  const handleRecorded = useCallback((recorded: UploadedMedia) => {
    setMedia((prev) => [...prev, recorded]);
  }, []);

  function updateAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  // Combine answered questions into a story body
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
      <p className="text-muted-foreground mb-4">
        Answer as many or as few questions as you like. Stories are reviewed
        before being published.
      </p>
      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground mb-8 p-3 bg-amber-50 rounded-lg">
          <Link href="/account/login" className="text-amber-700 hover:underline font-medium">
            Sign in
          </Link>
          {" "}or{" "}
          <Link href="/account/register" className="text-amber-700 hover:underline font-medium">
            create an account
          </Link>
          {" "}to track your story&apos;s approval status. You can also submit without an account.
        </p>
      )}

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
            <Label htmlFor="contributor_email">Email (optional)</Label>
            <Input
              id="contributor_email"
              name="contributor_email"
              type="email"
              placeholder="For follow-up only, never shared"
              defaultValue={defaultEmail}
            />
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
        {questions.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Your Story</h2>
              <p className="text-sm text-muted-foreground">
                Answer the questions that speak to you. Skip any that don&apos;t.
              </p>
            </div>

            {questions.map((q, i) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={`q-${q.id}`} className="text-base">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
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
            ))}
          </div>
        )}

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

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full bg-amber-700 hover:bg-amber-800"
        >
          {submitting ? "Submitting..." : "Submit Story"}
        </Button>
      </form>
    </div>
  );
}
