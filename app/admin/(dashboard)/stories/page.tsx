import { createServiceClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Star, Mic } from "lucide-react";
import type { Story, StoryStatus } from "@/types/database";

const STATUS_STYLES: Record<StoryStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
};

async function getStories(status?: StoryStatus) {
  const supabase = createServiceClient();
  let query = supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as Story[]) || [];
}

function StoryTable({ stories }: { stories: Story[] }) {
  if (stories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No stories to show.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Contributor</TableHead>
          <TableHead>Neighborhood</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stories.map((story) => {
          const style = STATUS_STYLES[story.status as StoryStatus];
          return (
            <TableRow key={story.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                <span className="flex items-center gap-1.5">
                  {story.featured_at && <Star className="h-3.5 w-3.5 nh-text fill-[var(--nh-accent)] shrink-0" />}
                  {story.title}
                </span>
              </TableCell>
              <TableCell>{story.contributor_name}</TableCell>
              <TableCell>{story.neighbourhood}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant={style.variant}>{style.label}</Badge>
                  {story.submission_mode === "audio" && (
                    <Badge variant="outline" className="text-xs">
                      <Mic className="h-3 w-3 mr-0.5" />
                      Audio
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(story.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/stories/${story.id}`}
                  className="text-sm nh-text hover:underline"
                >
                  Review
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function AdminStoriesPage() {
  const [pending, approved, rejected] = await Promise.all([
    getStories("pending"),
    getStories("approved"),
    getStories("rejected"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moderation Queue</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <StoryTable stories={pending} />
        </TabsContent>
        <TabsContent value="approved">
          <StoryTable stories={approved} />
        </TabsContent>
        <TabsContent value="rejected">
          <StoryTable stories={rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
