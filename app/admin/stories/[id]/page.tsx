import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MediaPlayer } from "@/components/media-player";
import { StoryBody } from "@/components/story-body";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { AdminActions } from "./admin-actions";
import type { StoryMedia, StoryStatus } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

const BUCKET_MAP: Record<string, string> = {
  image: "story-images",
  audio: "story-audio",
  video: "story-video",
};

const STATUS_STYLES: Record<StoryStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
};

export default async function AdminStoryReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*, story_media(*)")
    .eq("id", id)
    .single();

  if (!story) {
    notFound();
  }

  const mediaItems = (story.story_media as StoryMedia[]) || [];
  const sortedMedia = mediaItems.sort((a, b) => a.sort_order - b.sort_order);
  const style = STATUS_STYLES[story.status as StoryStatus];

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/stories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Queue
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Badge variant={style.variant}>{style.label}</Badge>
        {story.contributor_email && (
          <span className="text-sm text-muted-foreground">
            {story.contributor_email}
          </span>
        )}
      </div>

      <article className="mb-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {story.neighbourhood}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(story.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{story.title}</h1>
          <p className="text-muted-foreground">by {story.contributor_name}</p>
        </header>

        {/* Media */}
        {sortedMedia.length > 0 && (
          <div className="space-y-4 mb-6">
            {sortedMedia.map((m) => {
              const bucket = BUCKET_MAP[m.media_type];
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(m.storage_path);

              return (
                <MediaPlayer key={m.id} media={m} publicUrl={publicUrl} />
              );
            })}
          </div>
        )}

        {/* Story body */}
        <StoryBody body={story.body} />

        {story.admin_notes && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Admin Notes:</p>
            <p className="text-sm text-muted-foreground">{story.admin_notes}</p>
          </div>
        )}
      </article>

      <AdminActions storyId={story.id} currentStatus={story.status} />
    </div>
  );
}
