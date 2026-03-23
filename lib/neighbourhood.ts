import { createClient, createServiceClient } from "@/utils/supabase/server";
import type { Neighbourhood } from "@/types/database";

export async function getNeighbourhoodBySlug(slug: string): Promise<Neighbourhood | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("neighbourhoods")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Neighbourhood | null;
}

export async function getAllNeighbourhoods(): Promise<Neighbourhood[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("neighbourhoods")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data as Neighbourhood[]) || [];
}
