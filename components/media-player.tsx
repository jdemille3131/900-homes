import type { StoryMedia } from "@/types/database";

interface MediaPlayerProps {
  media: StoryMedia;
  publicUrl: string;
}

export function MediaPlayer({ media, publicUrl }: MediaPlayerProps) {
  switch (media.media_type) {
    case "image":
      return (
        <img
          src={publicUrl}
          alt={media.file_name || "Story image"}
          className="rounded-lg w-full max-h-[500px] object-cover"
        />
      );
    case "audio":
      return (
        <div className="bg-muted/30 rounded-lg p-4">
          <audio controls className="w-full" preload="metadata">
            <source src={publicUrl} type={media.mime_type || "audio/webm"} />
            Your browser does not support the audio element.
          </audio>
          {media.file_name && (
            <p className="text-xs text-muted-foreground mt-2">{media.file_name}</p>
          )}
        </div>
      );
    case "video":
      return (
        <video
          controls
          className="rounded-lg w-full max-h-[500px]"
          preload="metadata"
        >
          <source src={publicUrl} type={media.mime_type || "video/mp4"} />
          Your browser does not support the video element.
        </video>
      );
    default:
      return null;
  }
}
