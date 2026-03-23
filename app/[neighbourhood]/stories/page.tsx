import { createClient } from "@/utils/supabase/server";
import { getNeighbourhoodBySlug } from "@/lib/neighbourhood";
import { StoryCard } from "@/components/story-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import type { Story, StoryMedia } from "@/types/database";

interface Props {
  params: Promise<{ neighbourhood: string }>;
  searchParams: Promise<{ q?: string; type?: string; mode?: string }>;
}

export default async function StoriesPage({ params, searchParams }: Props) {
  const { neighbourhood: slug } = await params;
  const sp = await searchParams;
  const neighbourhood = await getNeighbourhoodBySlug(slug);
  if (!neighbourhood) notFound();

  const prefix = `/${slug}`;
  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*, story_media(*)", { count: "exact" })
    .eq("status", "approved")
    .eq("neighbourhood_id", neighbourhood.id)
    .order("featured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (sp.q) {
    query = query.or(`title.ilike.%${sp.q}%,body.ilike.%${sp.q}%`);
  }
  if (sp.type) {
    query = query.eq("story_type", sp.type);
  }
  if (sp.mode === "audio") {
    query = query.eq("submission_mode", "audio");
  }

  const { data: stories, count } = await query;
  const storyCount = count ?? 0;

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

  function filterUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...sp, ...newParams };
    const searchP = new URLSearchParams();
    if (merged.q) searchP.set("q", merged.q);
    if (merged.type) searchP.set("type", merged.type);
    if (merged.mode) searchP.set("mode", merged.mode);
    const qs = searchP.toString();
    return `${prefix}/stories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Stories</h1>
      <p className="text-muted-foreground mb-8">
        {storyCount > 0
          ? `${storyCount} ${storyCount === 1 ? "story" : "stories"} from ${neighbourhood.name}.`
          : `Discover the stories that make ${neighbourhood.name} home.`}
      </p>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <form className="flex gap-4">
          <Input
            name="q"
            placeholder="Search stories..."
            defaultValue={sp.q || ""}
            className="max-w-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 nh-bg text-white rounded-md nh-bg-hover text-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link href={filterUrl({ type: undefined })}>
            <Badge variant={!sp.type ? "default" : "secondary"} className="cursor-pointer">All</Badge>
          </Link>
          <Link href={filterUrl({ type: "life_story" })}>
            <Badge variant={sp.type === "life_story" ? "default" : "secondary"} className="cursor-pointer">Life Stories</Badge>
          </Link>
          <Link href={filterUrl({ type: "specific_event" })}>
            <Badge variant={sp.type === "specific_event" ? "default" : "secondary"} className="cursor-pointer">Moments</Badge>
          </Link>
          <span className="border-l mx-1" />
          <Link href={filterUrl({ mode: sp.mode === "audio" ? undefined : "audio" })}>
            <Badge variant={sp.mode === "audio" ? "default" : "outline"} className="cursor-pointer">Has Audio</Badge>
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
              linkPrefix={prefix}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {sp.q || sp.type || sp.mode
              ? "No stories found matching your filters."
              : "No stories yet. Be the first to share yours!"}
          </p>
          <Link href={`${prefix}/submit`} className="nh-text hover:underline mt-2 inline-block">
            Share a story
          </Link>
        </div>
      )}
    </div>
  );
}
