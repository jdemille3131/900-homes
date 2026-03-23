-- ============================================
-- Geographic Hierarchy: City/County/State
-- ============================================

-- Add geography to neighbourhoods
ALTER TABLE public.neighbourhoods ADD COLUMN city TEXT;
ALTER TABLE public.neighbourhoods ADD COLUMN county TEXT;
ALTER TABLE public.neighbourhoods ADD COLUMN state TEXT;

CREATE INDEX idx_neighbourhoods_city_state ON public.neighbourhoods(city, state);
CREATE INDEX idx_neighbourhoods_state ON public.neighbourhoods(state);

-- Add geography to profiles
ALTER TABLE public.profiles ADD COLUMN city TEXT;
ALTER TABLE public.profiles ADD COLUMN county TEXT;
ALTER TABLE public.profiles ADD COLUMN state TEXT;

CREATE INDEX idx_profiles_city_state ON public.profiles(city, state);
CREATE INDEX idx_profiles_state ON public.profiles(state);

-- Backfill Raintree Village
UPDATE public.neighbourhoods
SET city = 'Katy', county = 'Harris', state = 'TX'
WHERE slug = 'raintree-village';

-- Backfill existing profiles
UPDATE public.profiles
SET city = 'Katy', county = 'Harris', state = 'TX'
WHERE neighbourhood_id IS NOT NULL;

-- ============================================
-- Update handle_new_user trigger to copy geography
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  nh_record RECORD;
BEGIN
  SELECT city, county, state INTO nh_record
  FROM public.neighbourhoods
  WHERE id = (NEW.raw_user_meta_data->>'neighbourhood_id')::uuid;

  INSERT INTO public.profiles (id, email, display_name, neighbourhood_id, city, county, state)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    (NEW.raw_user_meta_data->>'neighbourhood_id')::uuid,
    nh_record.city,
    nh_record.county,
    nh_record.state
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
