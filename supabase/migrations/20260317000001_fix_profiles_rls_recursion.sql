-- ============================================
-- Fix infinite recursion in profiles RLS policies
-- ============================================
-- The "Admins can view all profiles" policy queries profiles
-- to check if the user is admin, which triggers RLS on profiles
-- again, causing infinite recursion. Fix by using auth.uid()
-- directly and a security-definer helper function.

-- Helper function to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- Fix questions policies (also reference profiles directly)
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;
CREATE POLICY "Admins can view all questions"
  ON public.questions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
CREATE POLICY "Admins can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
CREATE POLICY "Admins can update questions"
  ON public.questions FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;
CREATE POLICY "Admins can delete questions"
  ON public.questions FOR DELETE
  USING (public.is_admin());

-- Fix stories policies
DROP POLICY IF EXISTS "Admins can view all stories" ON public.stories;
CREATE POLICY "Admins can view all stories"
  ON public.stories FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update stories" ON public.stories;
CREATE POLICY "Admins can update stories"
  ON public.stories FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete stories" ON public.stories;
CREATE POLICY "Admins can delete stories"
  ON public.stories FOR DELETE
  USING (public.is_admin());

-- Fix story_media policies
DROP POLICY IF EXISTS "Admins can view all media" ON public.story_media;
CREATE POLICY "Admins can view all media"
  ON public.story_media FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete media" ON public.story_media;
CREATE POLICY "Admins can delete media"
  ON public.story_media FOR DELETE
  USING (public.is_admin());
