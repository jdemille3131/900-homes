-- ============================================
-- Multi-Neighbourhood Support
-- ============================================

-- Neighbourhoods table
CREATE TABLE public.neighbourhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  accent_color TEXT NOT NULL DEFAULT '#b45309',
  logo_url TEXT,
  home_count TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neighbourhoods_slug ON public.neighbourhoods(slug);

CREATE TRIGGER neighbourhoods_updated_at
  BEFORE UPDATE ON public.neighbourhoods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add neighbourhood_id FK to profiles
ALTER TABLE public.profiles
  ADD COLUMN neighbourhood_id UUID REFERENCES public.neighbourhoods(id);

CREATE INDEX idx_profiles_neighbourhood_id ON public.profiles(neighbourhood_id);

-- Add neighbourhood_id FK to stories
ALTER TABLE public.stories
  ADD COLUMN neighbourhood_id UUID REFERENCES public.neighbourhoods(id);

CREATE INDEX idx_stories_neighbourhood_id ON public.stories(neighbourhood_id);

-- ============================================
-- Seed Raintree Village and backfill
-- ============================================

INSERT INTO public.neighbourhoods (slug, name, tagline, accent_color, home_count)
VALUES (
  'raintree-village',
  'Raintree Village, Katy TX',
  'Behind every door in Raintree Village is a lifetime of memories.',
  '#b45309',
  'Over 900'
);

-- Backfill existing stories
UPDATE public.stories
SET neighbourhood_id = (SELECT id FROM public.neighbourhoods WHERE slug = 'raintree-village')
WHERE neighbourhood_id IS NULL;

-- Backfill existing profiles
UPDATE public.profiles
SET neighbourhood_id = (SELECT id FROM public.neighbourhoods WHERE slug = 'raintree-village')
WHERE neighbourhood_id IS NULL;

-- ============================================
-- Update handle_new_user trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, neighbourhood_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    (NEW.raw_user_meta_data->>'neighbourhood_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS Policies for neighbourhoods
-- ============================================

ALTER TABLE public.neighbourhoods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active neighbourhoods (registration, landing page)
CREATE POLICY "Anyone can view active neighbourhoods"
  ON public.neighbourhoods FOR SELECT
  USING (is_active = true);

-- Admins can view all neighbourhoods (including inactive)
CREATE POLICY "Admins can view all neighbourhoods"
  ON public.neighbourhoods FOR SELECT
  USING (public.is_admin());

-- Admin CRUD
CREATE POLICY "Admins can insert neighbourhoods"
  ON public.neighbourhoods FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update neighbourhoods"
  ON public.neighbourhoods FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete neighbourhoods"
  ON public.neighbourhoods FOR DELETE
  USING (public.is_admin());

-- ============================================
-- Logo storage bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('neighbourhood-logos', 'neighbourhood-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read for neighbourhood logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neighbourhood-logos');

CREATE POLICY "Admins can upload neighbourhood logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'neighbourhood-logos' AND public.is_admin());

CREATE POLICY "Admins can delete neighbourhood logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'neighbourhood-logos' AND public.is_admin());
