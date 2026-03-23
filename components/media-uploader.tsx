"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileAudio, FileVideo, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import type { MediaType } from "@/types/database";

export interface UploadedMedia {
  storage_path: string;
  media_type: MediaType;
  file_name: string;
  file_size: number;
  mime_type: string;
  preview_url?: string;
}

interface MediaUploaderProps {
  storyId: string;
  onMediaChange: (media: UploadedMedia[]) => void;
  media: UploadedMedia[];
}

const MIME_TO_TYPE: Record<string, MediaType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/webm": "audio",
  "audio/ogg": "audio",
  "audio/mp4": "audio",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
};

const BUCKET_MAP: Record<MediaType, string> = {
  image: "story-images",
  audio: "story-audio",
  video: "story-video",
};

const ICON_MAP: Record<MediaType, typeof ImageIcon> = {
  image: ImageIcon,
  audio: FileAudio,
  video: FileVideo,
};

function getMediaType(mimeType: string): MediaType | null {
  return MIME_TO_TYPE[mimeType] || null;
}

export function MediaUploader({ storyId, onMediaChange, media }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const uploadFile = useCallback(async (file: File): Promise<UploadedMedia | null> => {
    const mediaType = getMediaType(file.type);
    if (!mediaType) return null;

    const bucket = BUCKET_MAP[mediaType];
    const ext = file.name.split(".").pop();
    const path = `${storyId}/${crypto.randomUUID()}.${ext}`;

    const supabase = createClient();

    setProgress((prev) => ({ ...prev, [file.name]: 0 }));

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      setProgress((prev) => {
        const next = { ...prev };
        delete next[file.name];
        return next;
      });
      return null;
    }

    setProgress((prev) => ({ ...prev, [file.name]: 100 }));

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      storage_path: path,
      media_type: mediaType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      preview_url: publicUrl,
    };
  }, [storyId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const results = await Promise.all(acceptedFiles.map(uploadFile));
    const successful = results.filter((r): r is UploadedMedia => r !== null);
    onMediaChange([...media, ...successful]);
    setUploading(false);
    setProgress({});
  }, [media, onMediaChange, uploadFile]);

  const removeMedia = useCallback((index: number) => {
    const updated = media.filter((_, i) => i !== index);
    onMediaChange(updated);
  }, [media, onMediaChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      "audio/*": [".mp3", ".wav", ".webm", ".ogg", ".m4a"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxSize: 200 * 1024 * 1024, // 200MB max
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "nh-border nh-bg-light"
            : "border-muted-foreground/25 hover:nh-border"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop photos, audio, or video — or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images up to 10MB, audio up to 50MB, video up to 200MB
        </p>
      </div>

      {/* Upload progress */}
      {Object.entries(progress).map(([name, pct]) => (
        <div key={name} className="flex items-center gap-3 text-sm">
          <span className="truncate flex-1">{name}</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full nh-bg transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}

      {uploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}

      {/* Uploaded media list */}
      {media.length > 0 && (
        <div className="space-y-2">
          {media.map((m, i) => {
            const Icon = ICON_MAP[m.media_type];
            return (
              <div
                key={m.storage_path}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{m.file_name}</span>
                <span className="text-xs text-muted-foreground">
                  {(m.file_size / 1024 / 1024).toFixed(1)} MB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedia(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
