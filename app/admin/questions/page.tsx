import { createClient } from "@/utils/supabase/server";
import type { Question } from "@/types/database";
import { QuestionsList } from "./questions-list";

export const metadata = {
  title: "Manage Questions",
};

export default async function AdminQuestionsPage() {
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Story Prompts</h1>
      <p className="text-muted-foreground mb-6">
        These questions guide storytellers through their submission. You can edit,
        reorder, add, or disable questions.
      </p>
      <QuestionsList questions={(questions as Question[]) || []} />
    </div>
  );
}
