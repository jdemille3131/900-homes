"use server";

import { createServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createNeighbourhood(input: {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  accent_color?: string;
  home_count?: string;
}) {
  const supabase = createServiceClient();

  const slug = input.slug || slugify(input.name);

  const { error } = await supabase.from("neighbourhoods").insert({
    name: input.name,
    slug,
    tagline: input.tagline || null,
    description: input.description || null,
    accent_color: input.accent_color || "#b45309",
    home_count: input.home_count || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/neighbourhoods");
  revalidatePath("/");
  return { success: true };
}

export async function updateNeighbourhood(
  id: string,
  data: {
    name?: string;
    slug?: string;
    tagline?: string;
    description?: string;
    accent_color?: string;
    home_count?: string;
    logo_url?: string;
    admin_notes?: string;
    is_active?: boolean;
  }
) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("neighbourhoods")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/neighbourhoods");
  revalidatePath("/");
  return { success: true };
}

export async function toggleNeighbourhoodActive(id: string) {
  const supabase = createServiceClient();

  const { data: nh } = await supabase
    .from("neighbourhoods")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!nh) return { error: "Neighbourhood not found" };

  const { error } = await supabase
    .from("neighbourhoods")
    .update({ is_active: !nh.is_active })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/neighbourhoods");
  revalidatePath("/");
  return { success: true, isActive: !nh.is_active };
}
