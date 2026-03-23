"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { UploadedMedia } from "@/components/media-uploader";

interface AudioRecorderProps {
  storyId: string;
  onRecorded: (media: UploadedMedia) => void;
}

export function AudioRecorder({ storyId, onRecorded }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
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
    } catch (err) {
      console.error("Microphone access denied:", err);
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

  const uploadRecording = useCallback(async () => {
    if (!recordedBlob) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${storyId}/${crypto.randomUUID()}.webm`;

    const { error } = await supabase.storage
      .from("story-audio")
      .upload(path, recordedBlob, {
        contentType: "audio/webm",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("story-audio")
      .getPublicUrl(path);

    onRecorded({
      storage_path: path,
      media_type: "audio",
      file_name: "recording.webm",
      file_size: recordedBlob.size,
      mime_type: "audio/webm",
      preview_url: publicUrl,
    });

    setRecordedBlob(null);
    setUploading(false);
    setDuration(0);
  }, [recordedBlob, storyId, onRecorded]);

  const discardRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-4">
        {!recording && !recordedBlob && (
          <Button type="button" variant="outline" onClick={startRecording}>
            <Mic className="h-4 w-4 mr-2" />
            Record Audio
          </Button>
        )}

        {recording && (
          <>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono">{formatTime(duration)}</span>
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </>
        )}

        {recordedBlob && !recording && (
          <div className="flex items-center gap-3 w-full">
            <audio
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="flex-1 h-10"
            />
            <span className="text-sm text-muted-foreground">
              {formatTime(duration)}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={uploadRecording}
              disabled={uploading}
              className="nh-bg nh-bg-hover"
            >
              {uploading ? "Uploading..." : "Use This"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={discardRecording}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
