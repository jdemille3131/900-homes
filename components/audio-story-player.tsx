import type { Question, StoryMedia } from "@/types/database";

interface AudioStoryPlayerProps {
  questions: Question[];
  media: StoryMedia[];
  supabaseUrl: string;
}

const BUCKET = "story-audio";

export function AudioStoryPlayer({ questions, media, supabaseUrl }: AudioStoryPlayerProps) {
  // Match each question to its audio media
  const pairs = questions.map((q) => {
    const audioMedia = media.find(
      (m) => m.question_id === q.id && m.media_type === "audio"
    );
    return { question: q, media: audioMedia };
  }).filter((p) => p.media);

  if (pairs.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        No audio recordings available for this story.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {pairs.map((pair, i) => {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${pair.media!.storage_path}`;

        return (
          <div key={pair.question.id} className="border-l-2 nh-border-light pl-5">
            <p className="text-xs text-muted-foreground mb-1">
              Question {i + 1} of {pairs.length}
            </p>
            <p className="text-sm italic nh-text mb-3">
              {pair.question.question}
            </p>
            <audio
              src={publicUrl}
              controls
              preload="metadata"
              className="w-full h-10"
            />
          </div>
        );
      })}
    </div>
  );
}
