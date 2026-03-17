import { createClient } from "@/utils/supabase/server";
import { MediaPlayer } from "@/components/media-player";
import { StoryBody } from "@/components/story-body";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { StoryMedia } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("title, body, neighbourhood")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!story) return { title: "Story Not Found" };

  return {
    title: story.title,
    description: story.body.slice(0, 160),
    openGraph: {
      title: `${story.title} | 900 Homes`,
      description: story.body.slice(0, 160),
    },
  };
}

const BUCKET_MAP: Record<string, string> = {
  image: "story-images",
  audio: "story-audio",
  video: "story-video",
};

export default async function StoryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*, story_media(*)")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!story) {
    notFound();
  }

  const mediaItems = (story.story_media as StoryMedia[]) || [];
  const sortedMedia = mediaItems.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/stories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Stories
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{story.title}</h1>
          <p className="text-muted-foreground">by {story.contributor_name}</p>
        </header>

        {/* Media */}
        {sortedMedia.length > 0 && (
          <div className="space-y-4 mb-8">
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
      </article>
    </div>
  );
}
