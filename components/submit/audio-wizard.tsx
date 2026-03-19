"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  Mic,
  Square,
  Trash2,
  ArrowLeft,
  ArrowRight,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import type { Question } from "@/types/database";
import type { UploadedMedia } from "@/components/media-uploader";

interface AudioWizardProps {
  questions: Question[];
  storyId: string;
  onComplete: (recordings: Record<string, UploadedMedia>) => void;
  onBack: () => void;
}

export function AudioWizard({ questions, storyId, onComplete, onBack }: AudioWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, UploadedMedia>>({});

  // Per-step recorder state
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const hasRecording = question && recordings[question.id] != null;

  // Reset local recorder state when navigating between questions
  useEffect(() => {
    setRecordedBlob(null);
    setDuration(0);
    setRecording(false);
  }, [currentIndex]);

  // Warn before leaving with unsaved recordings
  useEffect(() => {
    const count = Object.keys(recordings).length;
    if (count === 0) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [recordings]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      // mic denied — handled in UI
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [recording]);

  const uploadAndSave = useCallback(async () => {
    if (!recordedBlob || !question) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${storyId}/${question.id}.webm`;

    const { error } = await supabase.storage
      .from("story-audio")
      .upload(path, recordedBlob, {
        contentType: "audio/webm",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("story-audio").getPublicUrl(path);

    const media: UploadedMedia = {
      storage_path: path,
      media_type: "audio",
      file_name: `${question.id}.webm`,
      file_size: recordedBlob.size,
      mime_type: "audio/webm",
      preview_url: publicUrl,
    };

    setRecordings((prev) => ({ ...prev, [question.id]: media }));
    setRecordedBlob(null);
    setUploading(false);
  }, [recordedBlob, question, storyId]);

  const discardRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
  }, []);

  const removeExistingRecording = useCallback(() => {
    if (!question) return;
    setRecordings((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  }, [question]);

  function goNext() {
    if (isLast) {
      onComplete(recordings);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      onBack();
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Object.keys(recordings).length} recorded</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-700 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {question && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{question.question}</h2>
          {question.hint && (
            <p className="text-sm text-muted-foreground">{question.hint}</p>
          )}
        </div>
      )}

      {/* Recorder area */}
      <div className="border rounded-lg p-6 bg-muted/30 mb-6">
        {hasRecording && !recordedBlob && !recording ? (
          // Already recorded — show playback
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Recorded
            </div>
            <audio
              src={recordings[question.id].preview_url}
              controls
              className="w-full h-10"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeExistingRecording}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Re-record
            </Button>
          </div>
        ) : !recording && !recordedBlob ? (
          // Ready to record
          <div className="flex flex-col items-center gap-4 py-4">
            <Button
              type="button"
              size="lg"
              onClick={startRecording}
              className="bg-amber-700 hover:bg-amber-800 rounded-full h-16 w-16"
            >
              <Mic className="h-6 w-6" />
            </Button>
            <p className="text-sm text-muted-foreground">Tap to start recording</p>
          </div>
        ) : recording ? (
          // Recording in progress
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-lg font-mono">{formatTime(duration)}</span>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={stopRecording}
              className="rounded-full h-16 w-16"
            >
              <Square className="h-6 w-6" />
            </Button>
            <p className="text-sm text-muted-foreground">Recording...</p>
          </div>
        ) : recordedBlob ? (
          // Playback / confirm
          <div className="space-y-4">
            <audio
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="w-full h-10"
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {formatTime(duration)}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={uploadAndSave}
                disabled={uploading}
                className="bg-amber-700 hover:bg-amber-800"
              >
                {uploading ? "Saving..." : "Use This"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discardRecording}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Discard
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={goPrev}
          disabled={recording || uploading}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          {currentIndex === 0 ? "Back" : "Previous"}
        </button>
        <div className="flex items-center gap-3">
          {!hasRecording && !recordedBlob && !recording && (
            <button
              type="button"
              onClick={goNext}
              disabled={uploading}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              Skip
            </button>
          )}
          <Button
          type="button"
          onClick={goNext}
          disabled={recording || uploading}
          className="bg-amber-700 hover:bg-amber-800"
        >
          {isLast ? "Review & Submit" : "Next"}
          {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
        </Button>
        </div>
      </div>
    </div>
  );
}
