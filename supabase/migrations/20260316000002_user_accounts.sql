-- ============================================
-- 002: User self-registration & story ownership
-- ============================================

-- Add submitted_by to link stories to registered users
ALTER TABLE public.stories ADD COLUMN submitted_by UUID REFERENCES public.profiles(id);
CREATE INDEX idx_stories_submitted_by ON public.stories(submitted_by);

-- Policy: authenticated users can view their own stories (any status)
CREATE POLICY "Users can view own stories"
  ON public.stories FOR SELECT
  USING (submitted_by = auth.uid());

-- Policy: users can view media for their own stories
CREATE POLICY "Users can view own story media"
  ON public.story_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories WHERE id = story_id AND submitted_by = auth.uid()
    )
  );

-- Policy: admins can update profiles (for user management)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
