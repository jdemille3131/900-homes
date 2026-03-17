-- ============================================
-- 900 Homes — Initial Database Schema
-- ============================================

-- Profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  neighbourhood TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_status_created ON public.stories(status, created_at DESC);
CREATE INDEX idx_stories_neighbourhood ON public.stories(neighbourhood);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Story media table
CREATE TABLE public.story_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'audio', 'video')),
  storage_path TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_media_story_id ON public.story_media(story_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Stories policies
CREATE POLICY "Anyone can view approved stories"
  ON public.stories FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all stories"
  ON public.stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can submit stories"
  ON public.stories FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins can update stories"
  ON public.stories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete stories"
  ON public.stories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Story media policies
CREATE POLICY "Anyone can view media for approved stories"
  ON public.story_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories WHERE id = story_id AND status = 'approved'
    )
  );

CREATE POLICY "Admins can view all media"
  ON public.story_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert media"
  ON public.story_media FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete media"
  ON public.story_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Storage Buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('story-images', 'story-images', true),
  ('story-audio', 'story-audio', true),
  ('story-video', 'story-video', true);

-- Storage policies: public read
CREATE POLICY "Public read for story images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');

CREATE POLICY "Public read for story audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-audio');

CREATE POLICY "Public read for story video"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-video');

-- Storage policies: anyone can upload
CREATE POLICY "Anyone can upload story images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-images');

CREATE POLICY "Anyone can upload story audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-audio');

CREATE POLICY "Anyone can upload story video"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-video');

-- Storage policies: admin-only delete
CREATE POLICY "Admins can delete story images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete story audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-audio' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete story video"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-video' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
