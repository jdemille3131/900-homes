-- ============================================
-- Story Types & Submission Modes
-- ============================================

-- Add story_type and submission_mode to stories
ALTER TABLE public.stories
  ADD COLUMN story_type TEXT NOT NULL DEFAULT 'life_story'
    CHECK (story_type IN ('life_story', 'specific_event'));

ALTER TABLE public.stories
  ADD COLUMN submission_mode TEXT NOT NULL DEFAULT 'text'
    CHECK (submission_mode IN ('text', 'audio'));

-- Link audio recordings to specific questions
ALTER TABLE public.story_media
  ADD COLUMN question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL;

-- Allow questions to be scoped to a story type
ALTER TABLE public.questions
  ADD COLUMN story_type TEXT NOT NULL DEFAULT 'life_story'
    CHECK (story_type IN ('life_story', 'specific_event', 'both'));

-- Seed specific-event question
INSERT INTO public.questions (question, hint, sort_order, story_type) VALUES
  ('Tell us about a meaningful story or moment from your life.', 'It can be anything — big or small. Just share what matters to you.', 1, 'specific_event');
