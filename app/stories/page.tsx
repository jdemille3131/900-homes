import { createClient } from "@/utils/supabase/server";
import { StoryCard } from "@/components/story-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Story } from "@/types/database";

interface Props {
  searchParams: Promise<{ q?: string; neighbourhood?: string }>;
}

export const metadata = {
  title: "Stories",
  description: "Browse neighbourhood life stories from communities everywhere.",
};

export default async function StoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,body.ilike.%${params.q}%`
    );
  }

  if (params.neighbourhood) {
    query = query.eq("neighbourhood", params.neighbourhood);
  }

  const { data: stories } = await query;

  // Get unique neighbourhoods for filter
  const { data: neighbourhoods } = await supabase
    .from("stories")
    .select("neighbourhood")
    .eq("status", "approved");

  const uniqueNeighbourhoods = Array.from(
    new Set(neighbourhoods?.map((n) => n.neighbourhood) || [])
  ).sort();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Stories</h1>
      <p className="text-muted-foreground mb-8">
        Discover the stories that make our neighbourhoods home.
      </p>

      {/* Search & Filter */}
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

        {uniqueNeighbourhoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href="/stories">
              <Badge
                variant={!params.neighbourhood ? "default" : "secondary"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {uniqueNeighbourhoods.map((n) => (
              <Link key={n} href={`/stories?neighbourhood=${encodeURIComponent(n)}`}>
                <Badge
                  variant={params.neighbourhood === n ? "default" : "secondary"}
                  className="cursor-pointer"
                >
                  {n}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stories grid */}
      {stories && stories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(stories as Story[]).map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {params.q || params.neighbourhood
              ? "No stories found matching your search."
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
