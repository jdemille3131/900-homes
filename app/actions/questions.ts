"use server";

import { createServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createQuestion(question: string, hint?: string, isRequired: boolean = true) {
  const supabase = createServiceClient();

  // Get max sort_order
  const { data: existing } = await supabase
    .from("questions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

  const { error } = await supabase
    .from("questions")
    .insert({ question, hint: hint || null, sort_order: nextOrder, is_required: isRequired });

  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  revalidatePath("/submit");
  return { success: true };
}

export async function updateQuestion(
  id: string,
  data: { question?: string; hint?: string; is_active?: boolean; is_required?: boolean; sort_order?: number }
) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("questions")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  revalidatePath("/submit");
  return { success: true };
}

export async function deleteQuestion(id: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  revalidatePath("/submit");
  return { success: true };
}

export async function reorderQuestions(orderedIds: string[]) {
  const supabase = createServiceClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("questions")
      .update({ sort_order: index + 1 })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/admin/questions");
  revalidatePath("/submit");
  return { success: true };
}
