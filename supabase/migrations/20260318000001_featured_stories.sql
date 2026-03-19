-- ============================================
-- Featured Stories
-- ============================================

ALTER TABLE public.stories
  ADD COLUMN featured_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX idx_stories_featured ON public.stories(featured_at)
  WHERE featured_at IS NOT NULL;
