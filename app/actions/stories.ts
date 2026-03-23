"use server";

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
  return user;
}

const submitStorySchema = z.object({
  contributor_name: z.string().min(1, "Name is required").max(100),
  contributor_email: z.string().email("A valid email is required"),
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Story content is required"),
  neighbourhood: z.string().min(1, "Neighbourhood is required").max(100),
  story_type: z.enum(["life_story", "specific_event"]),
  submission_mode: z.enum(["text", "audio"]),
  hide_audio: z.boolean().optional(),
  answers: z.record(z.string(), z.string()).optional(),
  media: z.array(
    z.object({
      storage_path: z.string(),
      media_type: z.enum(["image", "audio", "video"]),
      file_name: z.string().optional(),
      file_size: z.number().optional(),
      mime_type: z.string().optional(),
      question_id: z.string().uuid().optional(),
    })
  ).optional(),
});

export type SubmitStoryInput = z.infer<typeof submitStorySchema>;

export async function submitStory(input: SubmitStoryInput) {
  const parsed = submitStorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { media, contributor_email, answers, story_type, submission_mode, hide_audio, ...storyData } = parsed.data;

  // Link story to authenticated user if logged in
  const { data: { user } } = await supabase.auth.getUser();

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .insert({
      ...storyData,
      contributor_email,
      story_type,
      submission_mode,
      status: "pending",
      submitted_by: user?.id || null,
      answers: answers || null,
      hide_audio: hide_audio || false,
    })
    .select("id")
    .single();

  if (storyError) {
    return { error: { _form: [storyError.message] } };
  }

  if (media && media.length > 0) {
    const mediaRows = media.map((m, i) => ({
      story_id: story.id,
      media_type: m.media_type,
      storage_path: m.storage_path,
      file_name: m.file_name || null,
      file_size: m.file_size || null,
      mime_type: m.mime_type || null,
      question_id: m.question_id || null,
      sort_order: i,
    }));

    const { error: mediaError } = await supabase
      .from("story_media")
      .insert(mediaRows);

    if (mediaError) {
      return { error: { _form: [mediaError.message] } };
    }
  }

  return { success: true, storyId: story.id };
}

export async function approveStory(storyId: string) {
  const user = await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("stories")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/stories");
  revalidatePath("/admin/stories");
  return { success: true };
}

export async function rejectStory(storyId: string, adminNotes?: string) {
  const user = await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("stories")
    .update({
      status: "rejected",
      admin_notes: adminNotes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/admin/stories");
  return { success: true };
}

export async function updateStoryFields(
  storyId: string,
  data: { title?: string; contributor_name?: string; body?: string; neighbourhood?: string }
) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("stories")
    .update(data)
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  return { success: true };
}

export async function toggleFeatureStory(storyId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  // Check current featured state
  const { data: story } = await supabase
    .from("stories")
    .select("featured_at")
    .eq("id", storyId)
    .single();

  if (!story) return { error: "Story not found" };

  const { error } = await supabase
    .from("stories")
    .update({
      featured_at: story.featured_at ? null : new Date().toISOString(),
    })
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/admin/stories");
  return { success: true, featured: !story.featured_at };
}

export async function toggleHideAudio(storyId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: story } = await supabase
    .from("stories")
    .select("hide_audio")
    .eq("id", storyId)
    .single();

  if (!story) return { error: "Story not found" };

  const newValue = !story.hide_audio;
  const { error } = await supabase
    .from("stories")
    .update({ hide_audio: newValue })
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  return { success: true, hideAudio: newValue };
}

export async function deleteStoryMedia(mediaId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: media } = await supabase
    .from("story_media")
    .select("id, storage_path, media_type, story_id")
    .eq("id", mediaId)
    .single();

  if (!media) return { error: "Media not found" };

  const bucketName = `story-${media.media_type}s`;
  await supabase.storage.from(bucketName).remove([media.storage_path]);

  const { error } = await supabase
    .from("story_media")
    .delete()
    .eq("id", mediaId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/stories/${media.story_id}`);
  revalidatePath(`/stories/${media.story_id}`);
  revalidatePath("/stories");
  return { success: true };
}

export async function addStoryMedia(
  storyId: string,
  mediaItems: {
    storage_path: string;
    media_type: "image" | "audio" | "video";
    file_name?: string;
    file_size?: number;
    mime_type?: string;
  }[]
) {
  await requireAdmin();
  const supabase = createServiceClient();

  // Get current max sort_order
  const { data: existing } = await supabase
    .from("story_media")
    .select("sort_order")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const startOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const rows = mediaItems.map((m, i) => ({
    story_id: storyId,
    media_type: m.media_type,
    storage_path: m.storage_path,
    file_name: m.file_name || null,
    file_size: m.file_size || null,
    mime_type: m.mime_type || null,
    sort_order: startOrder + i,
  }));

  const { error } = await supabase.from("story_media").insert(rows);

  if (error) return { error: error.message };

  revalidatePath(`/admin/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/stories");
  return { success: true };
}

export async function deleteStory(storyId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  // Get media to clean up storage
  const { data: media } = await supabase
    .from("story_media")
    .select("storage_path, media_type")
    .eq("story_id", storyId);

  if (media) {
    const bucketMap: Record<string, string[]> = {
      image: [],
      audio: [],
      video: [],
    };
    for (const m of media) {
      bucketMap[m.media_type]?.push(m.storage_path);
    }

    for (const [type, paths] of Object.entries(bucketMap)) {
      if (paths.length > 0) {
        await supabase.storage.from(`story-${type}s`).remove(paths);
      }
    }
  }

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId);

  if (error) return { error: error.message };

  revalidatePath("/stories");
  revalidatePath("/admin/stories");
  return { success: true };
}
