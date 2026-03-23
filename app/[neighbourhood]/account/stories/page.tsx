import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, Eye, PenLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { StoryStatus } from "@/types/database";

const STATUS_CONFIG: Record<StoryStatus, { label: string; variant: "default" | "secondary" | "destructive"; description: string }> = {
  pending: {
    label: "Pending Review",
    variant: "secondary",
    description: "Your story is waiting to be reviewed by a moderator.",
  },
  approved: {
    label: "Published",
    variant: "default",
    description: "Your story is live and visible to everyone!",
  },
  rejected: {
    label: "Not Published",
    variant: "destructive",
    description: "Your story was not published.",
  },
};

export const metadata = {
  title: "My Stories",
};

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export default async function MyStoriesPage({ params }: Props) {
  const { neighbourhood: slug } = await params;
  const prefix = `/${slug}`;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${prefix}/account/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  const pendingCount = stories?.filter((s) => s.status === "pending").length || 0;
  const approvedCount = stories?.filter((s) => s.status === "approved").length || 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Stories</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || user.email}
          </p>
        </div>
        <Link
          href={`${prefix}/submit`}
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg nh-bg text-white font-medium nh-bg-hover transition-colors"
        >
          <PenLine className="h-4 w-4 mr-2" />
          New Story
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{stories?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Submitted</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{approvedCount}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
      </div>

      {/* Stories list */}
      {stories && stories.length > 0 ? (
        <div className="space-y-4">
          {stories.map((story) => {
            const config = STATUS_CONFIG[story.status as StoryStatus];
            return (
              <Card key={story.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg">{story.title}</h3>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.body}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {story.neighbourhood}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(story.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {story.status === "approved" && (
                      <Link
                        href={`${prefix}/stories/${story.id}`}
                        className="flex items-center gap-1 nh-text hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        View published
                      </Link>
                    )}
                  </div>
                  {story.status === "rejected" && story.admin_notes && (
                    <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-800">
                      <strong>Moderator note:</strong> {story.admin_notes}
                    </div>
                  )}
                  {story.status === "pending" && (
                    <p className="mt-3 text-xs text-muted-foreground italic">
                      {config.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">
            You haven&apos;t submitted any stories yet.
          </p>
          <Link
            href={`${prefix}/submit`}
            className="nh-text hover:underline font-medium"
          >
            Share your first story
          </Link>
        </div>
      )}
    </div>
  );
}
