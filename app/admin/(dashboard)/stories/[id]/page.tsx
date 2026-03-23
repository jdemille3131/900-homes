import { createServiceClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MediaPlayer } from "@/components/media-player";
import { StoryBody } from "@/components/story-body";
import { MapPin, Clock, ArrowLeft, User, Mic, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { AdminActions } from "./admin-actions";
import { StoryEditor } from "./story-editor";
import { MediaManager } from "./media-manager";
import type { StoryMedia, StoryStatus, Profile, Question } from "@/types/database";
import type { AudioContextItem } from "./story-editor";

interface Props {
  params: Promise<{ id: string }>;
}

const BUCKET_MAP: Record<string, string> = {
  image: "story-images",
  audio: "story-audio",
  video: "story-video",
};

const STATUS_STYLES: Record<StoryStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
};

export default async function AdminStoryReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*, story_media(*)")
    .eq("id", id)
    .single();

  if (!story) {
    notFound();
  }

  const mediaItems = (story.story_media as StoryMedia[]) || [];
  const sortedMedia = mediaItems.sort((a, b) => a.sort_order - b.sort_order);
  const style = STATUS_STYLES[story.status as StoryStatus];
  const isAudio = story.submission_mode === "audio";

  // For audio stories, fetch questions linked to recordings
  let questionsMap: Record<string, Question> = {};
  if (isAudio) {
    const questionIds = mediaItems
      .filter((m) => m.question_id)
      .map((m) => m.question_id as string);
    if (questionIds.length > 0) {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds);
      for (const q of (questions as Question[]) || []) {
        questionsMap[q.id] = q;
      }
    }
  }

  // Get submitter profile if story was submitted by a logged-in user
  let submitterProfile: Profile | null = null;
  if (story.submitted_by) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", story.submitted_by)
      .single();
    submitterProfile = profile as Profile | null;
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/stories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Queue
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Badge variant={style.variant}>{style.label}</Badge>
        {story.contributor_email && (
          <span className="text-sm text-muted-foreground">
            {story.contributor_email}
          </span>
        )}
      </div>

      {/* Submitter profile card */}
      {submitterProfile && (
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <User className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{submitterProfile.display_name || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{submitterProfile.email}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>
                <Badge variant={submitterProfile.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {submitterProfile.role}
                </Badge>
              </p>
              {submitterProfile.move_in_year && (
                <p className="mt-1">Moved in {submitterProfile.move_in_year}</p>
              )}
              {submitterProfile.street_address && (
                <p>{submitterProfile.street_address}</p>
              )}
            </div>
          </div>
          {submitterProfile.bio && (
            <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{submitterProfile.bio}</p>
          )}
          {submitterProfile.phone && (
            <p className="text-sm text-muted-foreground mt-1">Phone: {submitterProfile.phone}</p>
          )}
        </div>
      )}

      <article className="mb-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {story.neighbourhood}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(story.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </header>

        {/* Media */}
        {isAudio && sortedMedia.some((m) => m.media_type === "audio") ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="h-4 w-4 text-amber-700" />
              <h3 className="font-semibold">Audio Recordings</h3>
              <Badge variant="outline" className="text-xs">
                {sortedMedia.filter((m) => m.media_type === "audio").length} recording{sortedMedia.filter((m) => m.media_type === "audio").length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="space-y-4">
              {sortedMedia.filter((m) => m.media_type === "audio").map((m, i) => {
                const bucket = BUCKET_MAP[m.media_type];
                const { data: { publicUrl } } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(m.storage_path);
                const question = m.question_id ? questionsMap[m.question_id] : null;

                return (
                  <div key={m.id} className="border-l-2 border-amber-200 pl-4 py-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Recording {i + 1}
                    </p>
                    {question && (
                      <p className="text-sm font-medium italic text-amber-700 mb-2">
                        {question.question}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <audio controls className="flex-1 h-10" preload="metadata">
                        <source src={publicUrl} type={m.mime_type || "audio/webm"} />
                      </audio>
                      <a
                        href={publicUrl}
                        download={m.file_name || `recording-${i + 1}.webm`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Non-audio media (uploaded images/video) */}
            {sortedMedia.filter((m) => m.media_type !== "audio").length > 0 && (
              <div className="space-y-4 mt-6">
                {sortedMedia.filter((m) => m.media_type !== "audio").map((m) => {
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
          </div>
        ) : sortedMedia.length > 0 ? (
          <div className="space-y-4 mb-6">
            {sortedMedia.map((m) => {
              const bucket = BUCKET_MAP[m.media_type];
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(m.storage_path);

              return (
                <MediaPlayer key={m.id} media={m} publicUrl={publicUrl} />
              );
            })}
          </div>
        ) : null}

        {/* Editable story content */}
        <StoryEditor
          storyId={story.id}
          initialTitle={story.title}
          initialContributorName={story.contributor_name}
          initialBody={story.body}
          audioContext={isAudio ? sortedMedia
            .filter((m) => m.media_type === "audio" && m.question_id)
            .map((m) => {
              const { data: { publicUrl } } = supabase.storage
                .from("story-audio")
                .getPublicUrl(m.storage_path);
              const question = m.question_id ? questionsMap[m.question_id] : null;
              return {
                question: question?.question || "Unknown question",
                audioUrl: publicUrl,
                fileName: m.file_name || `recording-${m.id}.webm`,
              } satisfies AudioContextItem;
            }) : undefined}
        />

        {/* Media Manager */}
        <div className="mt-6">
          <MediaManager
            storyId={story.id}
            initialMedia={sortedMedia.map((m) => {
              const bucket = BUCKET_MAP[m.media_type];
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(m.storage_path);
              return { item: m, publicUrl };
            })}
          />
        </div>

        {story.admin_notes && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Admin Notes:</p>
            <p className="text-sm text-muted-foreground">{story.admin_notes}</p>
          </div>
        )}
      </article>

      <AdminActions storyId={story.id} currentStatus={story.status} isFeatured={!!story.featured_at} isAudio={isAudio} hideAudio={!!story.hide_audio} />
    </div>
  );
}
