-- ============================================
-- 003: Structured story prompt questions
-- ============================================

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  hint TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_sort ON public.questions(sort_order);

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active questions"
  ON public.questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all questions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update questions"
  ON public.questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete questions"
  ON public.questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add story_answers column to stories (JSON mapping question_id -> answer)
ALTER TABLE public.stories ADD COLUMN answers JSONB;

-- Seed the initial questions
INSERT INTO public.questions (question, hint, sort_order) VALUES
  ('Where did you grow up? What was it like?', 'Easy warm-up — set the scene of your childhood.', 1),
  ('How did you end up living here in this neighborhood?', 'What brought you to this place?', 2),
  ('What was your first job?', NULL, 3),
  ('What moment in your life changed you the most?', NULL, 4),
  ('What was the hardest period in your life?', 'Share as much or as little as you''re comfortable with.', 5),
  ('What are you most proud of?', NULL, 6),
  ('Who influenced your life the most?', NULL, 7),
  ('What is something people misunderstand about you or your life?', NULL, 8),
  ('What advice would you give someone younger than you?', NULL, 9),
  ('What is something you wish you had done differently?', NULL, 10),
  ('What makes a good life in your opinion?', NULL, 11),
  ('What would you want your neighbors to know about you?', 'Your chance to speak directly to the people around you.', 12);
