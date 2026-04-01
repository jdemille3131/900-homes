-- Page sections: editable content blocks for static pages (e.g. About)
create table page_sections (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section_key text not null,
  heading text not null,
  body text not null,
  icon text,
  icon_color text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page, section_key)
);

create index idx_page_sections_page_order on page_sections (page, sort_order);

-- Reuse the existing updated_at trigger function
create trigger set_page_sections_updated_at
  before update on page_sections
  for each row execute function update_updated_at();

-- RLS
alter table page_sections enable row level security;

create policy "Public can view active page sections"
  on page_sections for select
  using (is_active = true);

-- Seed the about page with the current static content
insert into page_sections (page, section_key, heading, body, icon, icon_color, sort_order) values
(
  'about', 'hero', 'Why 900 Homes?',
  'Because the most extraordinary stories are hiding in the most ordinary places.',
  null, null, 1
),
(
  'about', 'problem', 'Stories are disappearing.',
  E'Every neighbourhood has them. The family that''s been on the same street since the houses were built. The retired teacher everyone waves to. The couple who met at the block party in 1987. The kid who grew up, moved away, and still calls it home.\n\nThese stories live in conversations over fences, at mailboxes, in driveways. They''re rarely written down. And when the people who carry them move away or pass on, the stories go with them — quietly, permanently.\n\nWe lose the thread of what made a place feel like <em>home</em>.',
  'Home', 'red', 2
),
(
  'about', 'mission', 'We''re catching them before they''re gone.',
  E'900 Homes is a community storytelling project. We go neighbourhood by neighbourhood, asking one simple question: <em>What''s your story?</em>\n\nSome people write. Some people talk into their phone. Some share a single memory; others tell the whole arc of their life on a street. There''s no wrong answer and no story too small.\n\nA retired firefighter remembering his first day on the job. A teenager describing what it''s like to grow up on a cul-de-sac. A widow recounting how her neighbours showed up with casseroles for three months straight. These are the stories that make a neighbourhood more than just a collection of houses.',
  'BookOpen', 'amber', 3
),
(
  'about', 'origin', 'How it started.',
  E'It started with a conversation. Someone mentioned that the neighbourhood they grew up in had over 900 homes — and they''d never heard the story of a single one. Not really. Not the <em>real</em> story.\n\nNot the developer''s brochure version, but the human version. Who lived there? What happened behind those doors? What did it feel like to be part of that place at that time?\n\nThe name stuck. 900 homes. 900 stories waiting to be told. And then we realized — every neighbourhood is like that. Every block, every street, every cul-de-sac is full of stories that nobody''s bothered to write down.\n\nSo we built a platform to change that.',
  'Users', 'blue', 4
),
(
  'about', 'vision', 'Where we''re going.',
  E'We''re building the world''s largest collection of neighbourhood life stories. Not celebrity memoirs. Not viral moments. Just regular people in regular places, telling the truth about what it means to live somewhere and call it home.\n\nOne neighbourhood at a time, one story at a time, we''re creating a living archive — something future residents can find and say, <em>"So that''s who lived here before me. That''s the kind of place this is."</em>\n\nEvery neighbourhood has a story. We''re here to make sure it gets told.',
  'Heart', 'green', 5
),
(
  'about', 'cta', 'Ready to share yours?',
  'Find your neighbourhood and add your story to the archive.',
  null, null, 6
);
