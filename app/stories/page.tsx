import { createClient } from "@/utils/supabase/server";
import { StoryCard } from "@/components/story-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";
import type { Story, StoryMedia } from "@/types/database";

interface Props {
  searchParams: Promise<{ q?: string; type?: string; mode?: string }>;
}

export const metadata = {
  title: "Stories",
  description: "Browse life stories from Raintree Village, Katy TX.",
};

export default async function StoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*, story_media(*)", { count: "exact" })
    .eq("status", "approved")
    .order("featured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,body.ilike.%${params.q}%`
    );
  }

  if (params.type) {
    query = query.eq("story_type", params.type);
  }

  if (params.mode === "audio") {
    query = query.eq("submission_mode", "audio");
  }

  const { data: stories, count } = await query;

  const storyCount = count ?? 0;

  // Helper: get first image URL for a story
  function getImageUrl(story: Story & { story_media?: StoryMedia[] }): string | null {
    const image = story.story_media
      ?.filter((m) => m.media_type === "image")
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!image) return null;
    const { data: { publicUrl } } = supabase.storage
      .from("story-images")
      .getPublicUrl(image.storage_path);
    return publicUrl;
  }

  // Build filter URL preserving other params
  function filterUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...params, ...newParams };
    const sp = new URLSearchParams();
    if (merged.q) sp.set("q", merged.q);
    if (merged.type) sp.set("type", merged.type);
    if (merged.mode) sp.set("mode", merged.mode);
    const qs = sp.toString();
    return `/stories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Stories</h1>
      <p className="text-muted-foreground mb-8">
        {storyCount > 0
          ? `${storyCount} ${storyCount === 1 ? "story" : "stories"} from Raintree Village.`
          : "Discover the stories that make Raintree Village home."}
      </p>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <form className="flex gap-4">
          <Input
            name="q"
            placeholder="Search stories..."
            defaultValue={params.q || ""}
            className="max-w-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link href={filterUrl({ type: undefined })}>
            <Badge
              variant={!params.type ? "default" : "secondary"}
              className="cursor-pointer"
            >
              All
            </Badge>
          </Link>
          <Link href={filterUrl({ type: "life_story" })}>
            <Badge
              variant={params.type === "life_story" ? "default" : "secondary"}
              className="cursor-pointer"
            >
              Life Stories
            </Badge>
          </Link>
          <Link href={filterUrl({ type: "specific_event" })}>
            <Badge
              variant={params.type === "specific_event" ? "default" : "secondary"}
              className="cursor-pointer"
            >
              Moments
            </Badge>
          </Link>
          <span className="border-l mx-1" />
          <Link href={filterUrl({ mode: params.mode === "audio" ? undefined : "audio" })}>
            <Badge
              variant={params.mode === "audio" ? "default" : "outline"}
              className="cursor-pointer"
            >
              Has Audio
            </Badge>
          </Link>
        </div>
      </div>

      {/* Stories grid */}
      {stories && stories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story as Story}
              imageUrl={getImageUrl(story as Story & { story_media?: StoryMedia[] })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {params.q || params.type || params.mode
              ? "No stories found matching your filters."
              : "No stories yet. Be the first to share yours!"}
          </p>
          <Link
            href="/submit"
            className="text-amber-700 hover:underline mt-2 inline-block"
          >
            Share a story
          </Link>
        </div>
      )}
    </div>
  );
}
