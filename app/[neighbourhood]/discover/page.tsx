import { createClient, createServiceClient } from "@/utils/supabase/server";
import { getNeighbourhoodBySlug } from "@/lib/neighbourhood";
import { StoryCard } from "@/components/story-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import type { Story, StoryMedia, Neighbourhood } from "@/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ neighbourhood: string }>;
  searchParams: Promise<{ scope?: string }>;
}

type StoryWithMediaAndNh = Story & { story_media?: StoryMedia[]; neighbourhoods?: Neighbourhood };

export default async function DiscoverPage({ params, searchParams }: Props) {
  const { neighbourhood: slug } = await params;
  const { scope = "city" } = await searchParams;
  const neighbourhood = await getNeighbourhoodBySlug(slug);
  if (!neighbourhood) notFound();
  if (!neighbourhood.discover_enabled) notFound();

  const prefix = `/${slug}`;
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // Get the current user's profile for geography
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`${prefix}/account/login`);

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("city, county, state, neighbourhood_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(`${prefix}/account/login`);

  const userCity = profile.city;
  const userState = profile.state;

  // Get all neighbourhoods for name lookups
  const { data: allNeighbourhoods } = await serviceClient
    .from("neighbourhoods")
    .select("id, name, slug, city, state")
    .eq("is_active", true);

  const nhMap = new Map((allNeighbourhoods || []).map((nh) => [nh.id, nh]));

  // Build neighbourhood ID filters based on scope
  let nhIds: string[] = [];
  let scopeLabel = "";

  if (scope === "city" && userCity && userState) {
    // Same city, different neighbourhood
    const cityNhs = (allNeighbourhoods || []).filter(
      (nh) => nh.city === userCity && nh.state === userState && nh.id !== neighbourhood.id
    );
    nhIds = cityNhs.map((nh) => nh.id);
    scopeLabel = `${userCity}, ${userState}`;
  } else if (scope === "state" && userState) {
    // Same state, different city
    const stateNhs = (allNeighbourhoods || []).filter(
      (nh) => nh.state === userState && nh.city !== userCity
    );
    nhIds = stateNhs.map((nh) => nh.id);
    scopeLabel = userState;
  } else if (scope === "all") {
    // Different states
    const otherNhs = (allNeighbourhoods || []).filter(
      (nh) => nh.state !== userState
    );
    nhIds = otherNhs.map((nh) => nh.id);
    scopeLabel = "Other States";
  }

  // Fetch stories
  let stories: StoryWithMediaAndNh[] = [];
  if (nhIds.length > 0) {
    const { data } = await serviceClient
      .from("stories")
      .select("*, story_media(*)")
      .eq("status", "approved")
      .in("neighbourhood_id", nhIds)
      .order("created_at", { ascending: false })
      .limit(30);
    stories = (data as StoryWithMediaAndNh[]) || [];
  }

  function getImageUrl(story: Story & { story_media?: StoryMedia[] }): string | null {
    const image = story.story_media
      ?.filter((m) => m.media_type === "image")
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!image) return null;
    const { data: { publicUrl } } = serviceClient.storage
      .from("story-images")
      .getPublicUrl(image.storage_path);
    return publicUrl;
  }

  function getNeighbourhoodName(story: Story): string {
    if (!story.neighbourhood_id) return "";
    const nh = nhMap.get(story.neighbourhood_id);
    return nh?.name || "";
  }

  function getNeighbourhoodSlug(story: Story): string {
    if (!story.neighbourhood_id) return "";
    const nh = nhMap.get(story.neighbourhood_id);
    return nh?.slug || "";
  }

  const scopes = [
    { key: "city", label: `My City${userCity ? ` (${userCity})` : ""}` },
    { key: "state", label: `My State${userState ? ` (${userState})` : ""}` },
    { key: "all", label: "Other States" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Discover Stories</h1>
      <p className="text-muted-foreground mb-8">
        Explore stories from beyond your neighbourhood.
      </p>

      {/* Scope tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {scopes.map((s) => (
          <Link key={s.key} href={`${prefix}/discover?scope=${s.key}`}>
            <Badge
              variant={scope === s.key ? "default" : "secondary"}
              className="cursor-pointer text-sm px-4 py-1"
            >
              {s.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Stories */}
      {stories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const storySlug = getNeighbourhoodSlug(story);
            const nhName = getNeighbourhoodName(story);
            return (
              <div key={story.id} className="relative">
                {nhName && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {nhName}
                    </Badge>
                  </div>
                )}
                <StoryCard
                  story={story}
                  imageUrl={getImageUrl(story)}
                  linkPrefix={storySlug ? `/${storySlug}` : prefix}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {nhIds.length === 0
              ? `No other neighbourhoods found ${scope === "city" ? "in your city" : scope === "state" ? "in your state" : "in other states"} yet.`
              : "No stories found in this area yet."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            As more neighbourhoods join 900 Homes, you&apos;ll see their stories here.
          </p>
        </div>
      )}
    </div>
  );
}
