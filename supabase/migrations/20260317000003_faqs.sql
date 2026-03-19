-- ============================================
-- FAQ System
-- ============================================

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_faqs_sort ON public.faqs(sort_order);

CREATE TRIGGER faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
  ON public.faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all FAQs"
  ON public.faqs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert FAQs"
  ON public.faqs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update FAQs"
  ON public.faqs FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete FAQs"
  ON public.faqs FOR DELETE
  USING (public.is_admin());

-- Seed initial FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
  (
    'What is 900 Homes?',
    '900 Homes is a community storytelling project dedicated to preserving the real stories of Raintree Village in Katy, TX. Our goal is to capture the memories, experiences, and voices of the people who make this neighborhood home — before those stories go untold.',
    1
  ),
  (
    'Who can share a story?',
    'Anyone with a connection to Raintree Village — current residents, former residents, longtime neighbors, or anyone who has a meaningful memory tied to the neighborhood. All ages and backgrounds are welcome.',
    2
  ),
  (
    'Do I need to create an account?',
    'Yes, a free account is required to submit a story. This helps us verify submissions and lets you track the status of your story as it goes through review.',
    3
  ),
  (
    'What kinds of stories can I share?',
    'Anything meaningful to you! You can share a broad life story covering your journey and how you ended up in Raintree Village, or a specific moment — a memory of a neighbor, a block party, a storm, a kindness, or anything that stuck with you. No story is too small.',
    4
  ),
  (
    'Can I record my story instead of writing it?',
    'Absolutely. When you submit a story, you can choose between "Write It" (type your answers) or "Record It" (speak your answers into your microphone one question at a time). The audio wizard guides you through each question step by step.',
    5
  ),
  (
    'Are stories published immediately?',
    'No. All stories go through a review process before being published. This helps us ensure quality and protect the privacy of everyone mentioned. You''ll be able to track your story''s status from your account.',
    6
  ),
  (
    'Will my email or personal information be shared?',
    'Never. Your email is used only for verification and follow-up questions about your story. It is never displayed publicly or shared with anyone outside the project.',
    7
  ),
  (
    'Can I edit or delete my story after submitting?',
    'Once submitted, stories enter the review queue. If you need to make changes or want to remove your story, contact us and we''ll take care of it.',
    8
  ),
  (
    'Can I include photos or videos with my story?',
    'Yes! You can upload photos, audio recordings, or video alongside your written or recorded story. These help bring your story to life and give readers a richer experience.',
    9
  ),
  (
    'How are stories organized on the site?',
    'Published stories appear on the Stories page and can be browsed by neighborhood. Each story has its own page with the full text, any media you included, and the questions you answered.',
    10
  ),
  (
    'Is this project affiliated with the HOA or any organization?',
    'No. 900 Homes is an independent community project created by and for the residents of Raintree Village. It is not affiliated with any HOA, government body, or commercial organization.',
    11
  ),
  (
    'I''m not a great writer. Can I still participate?',
    'Absolutely. You don''t need to be a writer — that''s why we offer guided questions and an audio recording option. Just speak from the heart. The best stories are honest ones, not polished ones.',
    12
  );
