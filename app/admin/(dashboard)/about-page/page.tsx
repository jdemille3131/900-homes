import { createServiceClient } from "@/utils/supabase/server";
import type { PageSection } from "@/types/database";
import { SectionsList } from "./sections-list";

export const metadata = {
  title: "Manage About Page",
};

export default async function AdminAboutPage() {
  const supabase = createServiceClient();

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page", "about")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">About Page Content</h1>
      <p className="text-muted-foreground mb-6">
        Edit the sections shown on the public &ldquo;Why 900 Homes?&rdquo; page. You can reorder, edit, disable, or add new sections.
      </p>
      <SectionsList sections={(sections as PageSection[]) || []} />
    </div>
  );
}
