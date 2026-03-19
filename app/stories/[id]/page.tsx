import { createClient } from "@/utils/supabase/server";
import { MediaPlayer } from "@/components/media-player";
import { StoryBody } from "@/components/story-body";
import { AudioStoryPlayer } from "@/components/audio-story-player";
import { StoryCard } from "@/components/story-card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Clock, ArrowLeft, Mic } from "lucide-react";

export const dynamic = "force-dynamic";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Story, StoryMedia, Question } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("title, body, contributor_name")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!story) return { title: "Story Not Found" };

  // Strip markdown for description
  const cleanBody = story.body.replace(/\*\*(.+?)\*\*/g, "$1");

  return {
    title: `${story.title} — ${story.contributor_name} | 900 Homes`,
    description: cleanBody.slice(0, 160),
    openGraph: {
      title: `${story.title} | 900 Homes`,
      description: cleanBody.slice(0, 160),
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

  const typedStory = story as Story & { story_media: StoryMedia[] };
  const mediaItems = typedStory.story_media || [];
  const sortedMedia = mediaItems.sort((a, b) => a.sort_order - b.sort_order);
  const isAudio = typedStory.submission_mode === "audio";
  const isLifeStory = typedStory.story_type === "life_story";

  // For audio stories, fetch the questions linked to media
  let audioQuestions: Question[] = [];
  if (isAudio) {
    const questionIds = mediaItems
      .filter((m) => m.question_id)
      .map((m) => m.question_id as string);

    if (questionIds.length > 0) {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds)
        .order("sort_order", { ascending: true });

      audioQuestions = (questions as Question[]) || [];
    }
  }

  // Non-audio media (images, videos) for text stories
  const nonAudioMedia = sortedMedia.filter((m) => m.media_type !== "audio");

  // Count answered questions for context line
  const answeredCount = typedStory.answers
    ? Object.values(typedStory.answers).filter((a) => a.trim().length > 0).length
    : 0;

  // Related stories with media for card images
  const { data: relatedStories } = await supabase
    .from("stories")
    .select("*, story_media(*)")
    .eq("status", "approved")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  function getImageUrl(s: Story & { story_media?: StoryMedia[] }): string | null {
    const image = s.story_media
      ?.filter((m) => m.media_type === "image")
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!image) return null;
    const { data: { publicUrl } } = supabase.storage
      .from("story-images")
      .getPublicUrl(image.storage_path);
    return publicUrl;
  }

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
            {isLifeStory ? (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <BookOpen className="h-3 w-3 mr-1" />
                Life Story
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                A Moment
              </Badge>
            )}
            {isAudio && (
              <Badge variant="outline">
                <Mic className="h-3 w-3 mr-1" />
                Audio Story
              </Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(typedStory.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{typedStory.title}</h1>
          <p className="text-lg text-amber-800 font-medium">
            {typedStory.contributor_name}
          </p>
          {!isAudio && answeredCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {typedStory.contributor_name} answered {answeredCount} question{answeredCount !== 1 ? "s" : ""} about {isLifeStory ? "their life in" : "a moment in"} Raintree Village.
            </p>
          )}
        </header>

        {/* Audio story: question-linked player */}
        {isAudio && audioQuestions.length > 0 ? (
          <AudioStoryPlayer
            questions={audioQuestions}
            media={sortedMedia}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ""}
          />
        ) : (
          <>
            {/* Non-audio media (images, videos) */}
            {nonAudioMedia.length > 0 && (
              <div className="space-y-4 mb-8">
                {nonAudioMedia.map((m) => {
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
            <StoryBody body={typedStory.body} />
          </>
        )}
      </article>

      {/* Related stories */}
      {relatedStories && relatedStories.length > 0 && (
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-6">More Stories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(relatedStories as (Story & { story_media?: StoryMedia[] })[]).map((s) => (
              <StoryCard key={s.id} story={s} imageUrl={getImageUrl(s)} />
            ))}
          </div>
          <div className="text-center mt-8 pt-6">
            <p className="text-muted-foreground mb-3">Inspired?</p>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors"
            >
              Share Your Own Story
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
