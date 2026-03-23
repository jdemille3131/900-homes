"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  display_name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(500).optional().or(z.literal("")),
  move_in_year: z.string().optional().or(z.literal("")),
  street_address: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")).or(z.null()),
  city: z.string().max(100).optional().or(z.literal("")),
  county: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(10).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export async function updateProfile(input: ProfileInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ["You must be signed in."] } };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { display_name, bio, move_in_year, street_address, phone, avatar_url, city, county, state } = parsed.data;

  const yearNum = move_in_year ? parseInt(move_in_year, 10) : null;
  if (yearNum !== null && (isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear())) {
    return { error: { move_in_year: ["Please enter a valid year."] } };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name,
      bio: bio || null,
      move_in_year: yearNum,
      street_address: street_address || null,
      phone: phone || null,
      avatar_url: avatar_url || null,
      city: city || null,
      county: county || null,
      state: state || null,
    })
    .eq("id", user.id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/account/profile");
  return { success: true };
}
