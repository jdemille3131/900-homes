import { createServiceClient } from "@/utils/supabase/server";
import type { Faq } from "@/types/database";
import { FaqsList } from "./faqs-list";

export const metadata = {
  title: "Manage FAQs",
};

export default async function AdminFaqsPage() {
  const supabase = createServiceClient();

  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">FAQ Management</h1>
      <p className="text-muted-foreground mb-6">
        Manage the questions and answers shown on the public FAQ page. You can add, edit, reorder, or disable entries.
      </p>
      <FaqsList faqs={(faqs as Faq[]) || []} />
    </div>
  );
}
