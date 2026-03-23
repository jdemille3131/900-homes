"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MediaUploader, type UploadedMedia } from "@/components/media-uploader";
import { deleteStoryMedia, addStoryMedia } from "@/app/actions/stories";
import { toast } from "sonner";
import { Trash2, Plus, Image as ImageIcon, FileAudio, FileVideo } from "lucide-react";
import type { StoryMedia } from "@/types/database";

interface MediaManagerProps {
  storyId: string;
  initialMedia: {
    item: StoryMedia;
    publicUrl: string;
  }[];
}

const ICON_MAP = {
  image: ImageIcon,
  audio: FileAudio,
  video: FileVideo,
};

export function MediaManager({ storyId, initialMedia }: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState(initialMedia);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [newMedia, setNewMedia] = useState<UploadedMedia[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleDelete(mediaId: string) {
    setDeleting(mediaId);
    const result = await deleteStoryMedia(mediaId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Media removed.");
      setMediaItems((prev) => prev.filter((m) => m.item.id !== mediaId));
    }
    setDeleting(null);
  }

  async function handleSaveNew() {
    if (newMedia.length === 0) return;
    setSaving(true);
    const result = await addStoryMedia(
      storyId,
      newMedia.map((m) => ({
        storage_path: m.storage_path,
        media_type: m.media_type,
        file_name: m.file_name,
        file_size: m.file_size,
        mime_type: m.mime_type,
      }))
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Media added.");
      // Add new items to local state so they appear immediately
      const addedItems = newMedia.map((m) => ({
        item: {
          id: crypto.randomUUID(), // temporary ID until refresh
          story_id: storyId,
          media_type: m.media_type,
          storage_path: m.storage_path,
          file_name: m.file_name,
          file_size: m.file_size,
          mime_type: m.mime_type,
          sort_order: mediaItems.length,
          question_id: null,
          created_at: new Date().toISOString(),
        } as StoryMedia,
        publicUrl: m.preview_url || "",
      }));
      setMediaItems((prev) => [...prev, ...addedItems]);
      setNewMedia([]);
      setShowUploader(false);
    }
    setSaving(false);
  }

  const handleNewMediaChange = useCallback((media: UploadedMedia[]) => {
    setNewMedia(media);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Media ({mediaItems.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploader(!showUploader)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Media
        </Button>
      </div>

      {/* Existing media */}
      {mediaItems.length === 0 && !showUploader && (
        <p className="text-sm text-muted-foreground">No media attached to this story.</p>
      )}

      <div className="grid gap-3">
        {mediaItems.map(({ item, publicUrl }) => {
          const Icon = ICON_MAP[item.media_type];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              {item.media_type === "image" ? (
                <img
                  src={publicUrl}
                  alt={item.file_name || "Media"}
                  className="h-16 w-16 object-cover rounded shrink-0"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-muted rounded shrink-0">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.file_name || item.storage_path}</p>
                <p className="text-xs text-muted-foreground">
                  {item.media_type}
                  {item.file_size ? ` · ${(item.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Upload new media */}
      {showUploader && (
        <div className="border rounded-lg p-4 space-y-4">
          <MediaUploader
            storyId={storyId}
            media={newMedia}
            onMediaChange={handleNewMediaChange}
          />
          {newMedia.length > 0 && (
            <Button
              onClick={handleSaveNew}
              disabled={saving}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {saving ? "Saving..." : `Save ${newMedia.length} file${newMedia.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
