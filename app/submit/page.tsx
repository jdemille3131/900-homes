"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { StoryTypeSelector } from "@/components/submit/story-type-selector";
import { SubmissionModeSelector } from "@/components/submit/submission-mode-selector";
import { TextForm } from "@/components/submit/text-form";
import { AudioWizard } from "@/components/submit/audio-wizard";
import { AudioReview } from "@/components/submit/audio-review";
import Link from "next/link";
import { UserPlus, LogIn } from "lucide-react";
import type { Question, StoryType, SubmissionMode } from "@/types/database";
import type { UploadedMedia } from "@/components/media-uploader";

type Step = "auth" | "type" | "mode" | "form" | "audio-review";

export default function SubmitPage() {
  const [step, setStep] = useState<Step>("auth");
  const [storyType, setStoryType] = useState<StoryType | null>(null);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode | null>(null);
  const [storyId] = useState(() => crypto.randomUUID());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [defaultName, setDefaultName] = useState("");
  const [defaultEmail, setDefaultEmail] = useState("");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<Record<string, UploadedMedia>>({});

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        setDefaultEmail(user.email || "");
        setDefaultName(user.user_metadata?.display_name || "");
        setStep("type");
      }
      setLoading(false);
    });

    supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setAllQuestions(data as Question[]);
      });
  }, []);

  // Filter questions based on selected story type, core first then optional
  const filteredQuestions = allQuestions
    .filter((q) => q.story_type === storyType || q.story_type === "both")
    .sort((a, b) => {
      if (a.is_required !== b.is_required) return a.is_required ? -1 : 1;
      return a.sort_order - b.sort_order;
    });

  function handleSelectType(type: StoryType) {
    setStoryType(type);
    setStep("mode");
  }

  function handleSelectMode(mode: SubmissionMode) {
    setSubmissionMode(mode);
    setStep("form");
  }

  function handleAudioComplete(recordings: Record<string, UploadedMedia>) {
    setAudioRecordings(recordings);
    setStep("audio-review");
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
      <p className="text-muted-foreground mb-4">
        {step === "auth" && "Create an account or sign in to share your story."}
        {step === "type" && "Everyone has a story worth telling. Pick how you'd like to share yours."}
        {step === "mode" && "Stories are reviewed before being published."}
        {(step === "form" || step === "audio-review") &&
          "Answer as many or as few questions as you like. Stories are reviewed before being published."}
      </p>

      {step === "auth" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/account/register?redirect=/submit"
              className="flex flex-col items-center gap-3 p-8 border rounded-lg hover:nh-border hover:shadow-md transition-all text-center"
            >
              <UserPlus className="h-10 w-10 nh-text" />
              <span className="text-lg font-semibold">Create an Account</span>
              <span className="text-sm text-muted-foreground">
                Sign up to submit and track your stories
              </span>
            </Link>
            <Link
              href="/account/login?redirect=/submit"
              className="flex flex-col items-center gap-3 p-8 border rounded-lg hover:nh-border hover:shadow-md transition-all text-center"
            >
              <LogIn className="h-10 w-10 nh-text" />
              <span className="text-lg font-semibold">Sign In</span>
              <span className="text-sm text-muted-foreground">
                Already have an account? Welcome back
              </span>
            </Link>
          </div>
        </div>
      )}

      {step === "type" && (
        <StoryTypeSelector onSelect={handleSelectType} />
      )}

      {step === "mode" && (
        <SubmissionModeSelector
          onSelect={handleSelectMode}
          onBack={() => setStep("type")}
        />
      )}

      {step === "form" && submissionMode === "text" && storyType && (
        <TextForm
          storyType={storyType}
          questions={filteredQuestions}
          storyId={storyId}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          onBack={() => setStep("mode")}
        />
      )}

      {step === "form" && submissionMode === "audio" && storyType && (
        <AudioWizard
          questions={filteredQuestions}
          storyId={storyId}
          onComplete={handleAudioComplete}
          onBack={() => setStep("mode")}
        />
      )}

      {step === "audio-review" && storyType && (
        <AudioReview
          storyType={storyType}
          questions={filteredQuestions}
          recordings={audioRecordings}
          storyId={storyId}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          onBack={() => setStep("form")}
        />
      )}
    </div>
  );
}
