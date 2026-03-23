-- ============================================
-- Test data: neighbourhoods + stories for Discover page
-- Run this manually in Supabase SQL Editor
-- ============================================

-- Create test neighbourhoods
INSERT INTO public.neighbourhoods (slug, name, tagline, accent_color, home_count, city, county, state) VALUES
  ('cinco-ranch', 'Cinco Ranch, Katy TX', 'Where neighbors become family.', '#2563eb', 'Over 4,000', 'Katy', 'Fort Bend', 'TX'),
  ('memorial-green', 'Memorial Green, Houston TX', 'Stories from the heart of Houston.', '#059669', 'Over 600', 'Houston', 'Harris', 'TX'),
  ('the-woodlands', 'The Woodlands, TX', 'Life among the pines.', '#7c3aed', 'Over 3,000', 'The Woodlands', 'Montgomery', 'TX'),
  ('lakewood-heights', 'Lakewood Heights, Atlanta GA', 'Southern stories, city roots.', '#dc2626', 'Over 500', 'Atlanta', 'DeKalb', 'GA'),
  ('park-slope', 'Park Slope, Brooklyn NY', 'Brownstone stories.', '#0891b2', 'Over 2,000', 'Brooklyn', 'Kings', 'NY');

-- Insert test stories for Cinco Ranch (same city as Raintree Village - Katy)
INSERT INTO public.stories (contributor_name, title, body, neighbourhood, status, story_type, submission_mode, neighbourhood_id)
VALUES
  ('Maria Garcia', 'The Cinco Ranch Farmer''s Market', '**What''s your favorite neighborhood tradition?**
Every Saturday morning, the farmer''s market comes alive. I''ve been going since 2008 and I still discover something new every time. The honey vendor knows my name now, and the tamale lady saves me a dozen if I''m running late.', 'Cinco Ranch', 'approved', 'life_story', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'cinco-ranch')),

  ('James Wilson', 'Coaching Little League', '**What''s a memory that captures life here?**
Thirteen years of coaching little league at Cinco Ranch. Some of those kids are in college now and they still text me after big games. This neighborhood raised them as much as their parents did.', 'Cinco Ranch', 'approved', 'specific_event', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'cinco-ranch'));

-- Insert test stories for Memorial Green (Houston - same state, different city)
INSERT INTO public.stories (contributor_name, title, body, neighbourhood, status, story_type, submission_mode, neighbourhood_id)
VALUES
  ('Patricia Chen', 'My Garden on Memorial', '**How did you end up here?**
We moved from Sugar Land in 2015. The first thing I did was plant a magnolia in the front yard. My neighbor Helen came over with sweet tea and said "That tree will outlive us both." She was right — it''s already taller than the roof.', 'Memorial Green', 'approved', 'life_story', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'memorial-green')),

  ('David Nguyen', 'The Great Flood of 2017', '**What moment changed everything?**
Harvey hit us hard. But what I remember most isn''t the water — it''s the line of trucks from all over Texas that showed up the next morning. Strangers pulling drywall out of our houses. Memorial Green rebuilt itself in weeks because of people who didn''t even live here.', 'Memorial Green', 'approved', 'specific_event', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'memorial-green'));

-- Insert test stories for The Woodlands (TX - same state, different city)
INSERT INTO public.stories (contributor_name, title, body, neighbourhood, status, story_type, submission_mode, neighbourhood_id)
VALUES
  ('Robert Thompson', 'Running the Waterway', '**What do you love most about living here?**
Every morning at 5:30 I run the Waterway trail. In fifteen years I''ve watched the skyline change, but the herons are still there every single morning, standing in the same spots like they own the place. And they do.', 'The Woodlands', 'approved', 'life_story', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'the-woodlands')),

  ('Susan Park', 'The Ice Storm', '**What''s a story only someone from here would understand?**
February 2021. No power for four days. My Korean mother-in-law cooked bulgogi on a camping stove in the garage and fed the entire cul-de-sac. Twelve families, all different backgrounds, huddled in our living room playing cards by candlelight. That was The Woodlands at its best.', 'The Woodlands', 'approved', 'specific_event', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'the-woodlands'));

-- Insert test stories for Atlanta (different state)
INSERT INTO public.stories (contributor_name, title, body, neighbourhood, status, story_type, submission_mode, neighbourhood_id)
VALUES
  ('Angela Davis', 'Front Porch Fridays', '**What tradition defines your neighborhood?**
We started Front Porch Fridays in 2019. Every Friday evening, everyone sits on their porch with a drink. No phones, just conversation. You hear laughter up and down the block. People who''d lived next door for years finally learned each other''s names.', 'Lakewood Heights', 'approved', 'life_story', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'lakewood-heights')),

  ('Marcus Johnson', 'The Mural on Lakewood', '**What makes this place special?**
A local artist painted a mural on the old barbershop wall. It shows fifty years of Lakewood Heights — the church picnics, the block parties, the kids playing in fire hydrants. Every face in that mural is someone''s grandparent. People drive from across Atlanta just to see it.', 'Lakewood Heights', 'approved', 'specific_event', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'lakewood-heights'));

-- Insert test stories for Brooklyn (different state)
INSERT INTO public.stories (contributor_name, title, body, neighbourhood, status, story_type, submission_mode, neighbourhood_id)
VALUES
  ('Rachel Goldberg', 'Stoop Life', '**What does home mean to you?**
Home is the stoop. It''s where my daughter took her first steps, where we watched the Fourth of July fireworks, where my neighbor Tony plays his accordion every Sunday. Twenty years on this block and I still get butterflies walking up to our brownstone.', 'Park Slope', 'approved', 'life_story', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'park-slope')),

  ('Omar Hassan', 'The Bodega That Saved Christmas', '**What''s a story only your neighbors would believe?**
Christmas Eve 2022, massive snowstorm. Nothing''s open. Except Mr. Kim''s bodega on 7th. He stayed open until midnight, selling the last of everything — canned cranberries, frozen turkeys, even wrapping paper. Half of Park Slope had Christmas because of that man.', 'Park Slope', 'approved', 'specific_event', 'text',
    (SELECT id FROM public.neighbourhoods WHERE slug = 'park-slope'));
