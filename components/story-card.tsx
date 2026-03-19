import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Zap, Mic, Clock, User, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Story, StoryMedia } from "@/types/database";

interface StoryCardProps {
  story: Story;
  imageUrl?: string | null;
}

function getExcerpt(body: string): string {
  // Strip **bold** markdown markers
  const clean = body.replace(/\*\*(.+?)\*\*/g, "$1");
  // For Q&A bodies, try to extract the first answer (skip the question line)
  const sections = clean.split(/\n\n/).filter(Boolean);
  for (const section of sections) {
    const lines = section.split("\n").filter(Boolean);
    // If first line looks like a question, take the answer lines
    if (lines.length > 1 && lines[0].endsWith("?")) {
      const answer = lines.slice(1).join(" ").trim();
      if (answer.length > 0) {
        return answer.length > 150 ? answer.slice(0, 150) + "..." : answer;
      }
    }
  }
  // Fallback: just use cleaned body
  return clean.length > 150 ? clean.slice(0, 150) + "..." : clean;
}

export function StoryCard({ story, imageUrl }: StoryCardProps) {
  const excerpt = getExcerpt(story.body);
  const isLifeStory = story.story_type === "life_story";
  const isAudio = story.submission_mode === "audio";
  const isFeatured = !!story.featured_at;

  return (
    <Link href={`/stories/${story.id}`}>
      <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${isFeatured ? "ring-2 ring-amber-400" : ""}`}>
        {/* Image */}
        <div className="relative aspect-[3/2] bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-50">
              <User className="h-16 w-16 text-amber-200" />
            </div>
          )}
          {/* Featured star */}
          {isFeatured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}
          {/* Badges overlaid on image */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {isLifeStory ? (
              <Badge className="text-xs bg-amber-100/90 text-amber-800 hover:bg-amber-100 backdrop-blur-sm">
                <BookOpen className="h-3 w-3 mr-1" />
                Life Story
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/90">
                <Zap className="h-3 w-3 mr-1" />
                A Moment
              </Badge>
            )}
            {isAudio && (
              <Badge variant="outline" className="text-xs backdrop-blur-sm bg-white/90">
                <Mic className="h-3 w-3 mr-1" />
                Listen
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold line-clamp-2">
            {story.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-amber-800 font-medium">
              {story.contributor_name}
            </p>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(story.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
