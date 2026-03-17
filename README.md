# 900 Homes

A community storytelling platform for collecting hyperlocal neighbourhood life stories. Anyone can submit a story — text, photos, audio recordings, or video — and approved stories are published for the world to read.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres, Auth, Storage)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Validation**: [Zod](https://zod.dev/)
- **File Uploads**: [tus-js-client](https://github.com/tus/tus-js-client) (resumable) + [react-dropzone](https://react-dropzone.js.org/)

## Project Structure

```
900-homes/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout (header, footer, toaster)
│   ├── not-found.tsx                   # 404 page
│   ├── actions/
│   │   └── stories.ts                  # Server actions (submit, approve, reject, delete)
│   ├── stories/
│   │   ├── page.tsx                    # Browse & search approved stories
│   │   ├── loading.tsx                 # Skeleton loader
│   │   └── [id]/page.tsx              # Story detail with media
│   ├── submit/
│   │   ├── page.tsx                    # Public submission form
│   │   └── success/page.tsx           # Thank-you page
│   └── admin/
│       ├── layout.tsx                  # Admin sidebar layout
│       ├── page.tsx                    # Dashboard (status counts)
│       ├── login/page.tsx             # Admin login
│       └── stories/
│           ├── page.tsx                # Moderation queue (pending/approved/rejected tabs)
│           ├── loading.tsx             # Skeleton loader
│           └── [id]/
│               ├── page.tsx            # Review story detail + media
│               └── admin-actions.tsx   # Approve / reject / delete controls
├── components/
│   ├── site-header.tsx                 # Responsive nav with mobile menu
│   ├── site-footer.tsx                 # Footer with links
│   ├── story-card.tsx                  # Card component for story grid
│   ├── media-player.tsx                # Renders image / audio / video
│   ├── media-uploader.tsx              # Drag-and-drop upload with progress
│   ├── audio-recorder.tsx              # In-browser audio recording (MediaRecorder API)
│   └── ui/                             # shadcn/ui primitives
├── lib/
│   └── utils.ts                        # cn() classname utility
├── types/
│   └── database.ts                     # TypeScript interfaces (Story, StoryMedia, Profile)
├── utils/supabase/
│   ├── client.ts                       # Browser Supabase client
│   ├── server.ts                       # Server-side Supabase client
│   └── middleware.ts                   # Session refresh + admin route protection
├── supabase/migrations/
│   └── 001_initial_schema.sql          # Tables, indexes, RLS policies, storage buckets, triggers
├── middleware.ts                        # Next.js middleware (route matcher)
├── Dockerfile                          # Production Docker image
├── docker-compose.yml                  # Docker Compose for local dev
└── .env.local.example                  # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone & install

```bash
git clone <repo-url>
cd 900-homes
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up the database

Run the SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor. This creates:

- **Tables**: `profiles`, `stories`, `story_media`
- **Row Level Security**: public read for approved stories, admin-only moderation
- **Storage buckets**: `story-images`, `story-audio`, `story-video`
- **Triggers**: auto-create profile on signup, auto-update timestamps

### 4. Create an admin user

1. Create a user via Supabase Auth (Dashboard > Authentication > Users)
2. Run this SQL to promote them:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Using Dockerfile directly

```bash
docker build -t 900-homes .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  900-homes
```

## Database Schema

### stories

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| contributor_name | text | Display name of the storyteller |
| contributor_email | text | Optional contact email (never public) |
| title | text | Story title |
| body | text | Story content |
| neighbourhood | text | Neighbourhood name |
| status | text | `pending` / `approved` / `rejected` |
| admin_notes | text | Internal moderation notes |
| reviewed_by | uuid | Admin who reviewed |
| reviewed_at | timestamptz | When it was reviewed |

### story_media

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| story_id | uuid | FK to stories |
| media_type | text | `image` / `audio` / `video` |
| storage_path | text | Path in Supabase Storage |
| file_name | text | Original filename |
| file_size | bigint | Size in bytes |
| mime_type | text | MIME type |

### profiles

| Column | Type | Description |
|---|---|---|
| id | uuid | FK to auth.users |
| email | text | User email |
| display_name | text | Display name |
| role | text | `user` / `admin` |

## Key Features

- **No login required to submit** — removes friction, maximizes community participation
- **Moderation workflow** — all stories are reviewed before publishing
- **Multi-media support** — images (10MB), audio (50MB), video (200MB)
- **In-browser audio recording** — record directly from the submission form
- **Resumable uploads** — large files use the TUS protocol
- **Search & filter** — browse by neighbourhood, search by keyword
- **Responsive design** — mobile-first layout

## Deployment

### Vercel

```bash
npm run build
# Deploy via Vercel CLI or GitHub integration
```

### Docker (any host)

The included `Dockerfile` produces a production-optimized image using Next.js standalone output. Deploy to any container host (Railway, Fly.io, AWS ECS, etc.).

## License

MIT
