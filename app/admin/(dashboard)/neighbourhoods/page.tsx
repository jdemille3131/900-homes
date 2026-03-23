import { createServiceClient } from "@/utils/supabase/server";
import type { Neighbourhood } from "@/types/database";
import { NeighbourhoodsList } from "./neighbourhoods-list";

export const metadata = {
  title: "Neighbourhoods — Admin",
};

export default async function AdminNeighbourhoodsPage() {
  const supabase = createServiceClient();

  const { data: neighbourhoods } = await supabase
    .from("neighbourhoods")
    .select("*")
    .order("name");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Neighbourhoods</h1>
      <NeighbourhoodsList neighbourhoods={(neighbourhoods as Neighbourhood[]) || []} />
    </div>
  );
}
