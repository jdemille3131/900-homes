import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Story } from "@/types/database";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const excerpt =
    story.body.length > 150 ? story.body.slice(0, 150) + "..." : story.body;

  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {story.neighbourhood}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(story.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <h3 className="text-lg font-semibold mt-2 line-clamp-2">
            {story.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
          <p className="text-xs text-muted-foreground mt-3">
            by {story.contributor_name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
