import Link from "next/link";
import { BookOpen, Mic, PenLine, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getNeighbourhoodBySlug } from "@/lib/neighbourhood";
import { StoryCard } from "@/components/story-card";
import { notFound } from "next/navigation";
import type { Story, StoryMedia } from "@/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export default async function NeighbourhoodHomePage({ params }: Props) {
  const { neighbourhood: slug } = await params;
  const neighbourhood = await getNeighbourhoodBySlug(slug);
  if (!neighbourhood) notFound();

  const supabase = await createClient();
  const prefix = `/${slug}`;

  // Featured stories first, then recent — filtered by neighbourhood
  const { data: featuredStories } = await supabase
    .from("stories")
    .select("*, story_media(*)")
    .eq("status", "approved")
    .eq("neighbourhood_id", neighbourhood.id)
    .not("featured_at", "is", null)
    .order("featured_at", { ascending: false })
    .limit(3);

  const featured = (featuredStories as (Story & { story_media?: StoryMedia[] })[]) || [];

  const remainingSlots = 3 - featured.length;
  let recent: (Story & { story_media?: StoryMedia[] })[] = [];
  if (remainingSlots > 0) {
    const { data: recentData } = await supabase
      .from("stories")
      .select("*, story_media(*)")
      .eq("status", "approved")
      .eq("neighbourhood_id", neighbourhood.id)
      .is("featured_at", null)
      .order("created_at", { ascending: false })
      .limit(remainingSlots);
    recent = (recentData as (Story & { story_media?: StoryMedia[] })[]) || [];
  }

  const stories = [...featured, ...recent];

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

  const displayName = neighbourhood.name;
  const homeCount = neighbourhood.home_count || "Over 900";

  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--nh-accent-light)] to-background py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-semibold nh-text mb-4 flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" />
            {displayName}
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {homeCount} homes.
            <br />
            <span className="nh-text">{homeCount} stories waiting to be told.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
            {neighbourhood.tagline || `Behind every door in ${displayName} is a lifetime of memories. We're on a mission to find and preserve the stories of the people who make this neighborhood what it is — before they go untold.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${prefix}/submit`}
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
            >
              Share Your Story
            </Link>
            <Link
              href={`${prefix}/stories`}
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background font-medium hover:bg-muted transition-colors"
            >
              Read Stories
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full nh-bg-100">
                <PenLine className="h-7 w-7 nh-text" />
              </div>
              <h3 className="text-xl font-semibold">Write</h3>
              <p className="text-muted-foreground">
                Tell us about life in {displayName} — a memory, a neighbor, a
                place on these streets that matters to you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full nh-bg-100">
                <Mic className="h-7 w-7 nh-text" />
              </div>
              <h3 className="text-xl font-semibold">Record</h3>
              <p className="text-muted-foreground">
                Prefer to speak? Record audio or upload a video of your story
                directly from your device.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full nh-bg-100">
                <BookOpen className="h-7 w-7 nh-text" />
              </div>
              <h3 className="text-xl font-semibold">Discover</h3>
              <p className="text-muted-foreground">
                Read the stories of your neighbors and find the threads
                that connect us all right here in {displayName}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* From Your Neighbors */}
      {stories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-3">From Your Neighbors</h2>
            <p className="text-center text-muted-foreground mb-10">
              Real stories from the people of {displayName}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} imageUrl={getImageUrl(story)} linkPrefix={prefix} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`${prefix}/stories`}
                className="inline-flex items-center nh-text font-medium hover:nh-text-dark transition-colors"
              >
                Read More Stories
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="nh-bg-light py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            We&apos;re looking for your story.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            How did you end up in {displayName}? What do you remember most?
            Who are the neighbors that changed your life? No story is too small —
            help us uncover the real history of these streets.
          </p>
          <Link
            href={`${prefix}/submit`}
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
