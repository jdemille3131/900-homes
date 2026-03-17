export type StoryStatus = "pending" | "approved" | "rejected";
export type MediaType = "image" | "audio" | "video";
export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  move_in_year: number | null;
  street_address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  contributor_name: string;
  contributor_email: string | null;
  title: string;
  body: string;
  neighbourhood: string;
  status: StoryStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  submitted_by: string | null;
  answers: StoryAnswers | null;
}

export interface StoryMedia {
  id: string;
  story_id: string;
  media_type: MediaType;
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: string;
}

export interface StoryWithMedia extends Story {
  story_media: StoryMedia[];
}

export interface Question {
  id: string;
  question: string;
  hint: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// JSON stored in stories.answers: { [questionId]: answer }
export type StoryAnswers = Record<string, string>;
