import { createClient, createServiceClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/types/database";

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { neighbourhood: slug } = await params;
  const prefix = `/${slug}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${prefix}/account/login`);
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect(`${prefix}/account/login`);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-muted-foreground mb-8">
        Tell your neighbors a little about yourself.
      </p>
      <ProfileForm profile={profile as Profile} userId={user.id} />
    </div>
  );
}
