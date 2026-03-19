"use server";

import { createServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFaq(question: string, answer: string) {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

  const { error } = await supabase
    .from("faqs")
    .insert({ question, answer, sort_order: nextOrder });

  if (error) return { error: error.message };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}

export async function updateFaq(
  id: string,
  data: { question?: string; answer?: string; is_active?: boolean; sort_order?: number }
) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("faqs")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}

export async function deleteFaq(id: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("faqs")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}

export async function reorderFaqs(orderedIds: string[]) {
  const supabase = createServiceClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("faqs")
      .update({ sort_order: index + 1 })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}
