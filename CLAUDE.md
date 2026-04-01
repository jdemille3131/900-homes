# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

900 Homes is a multi-neighbourhood storytelling platform built with Next.js 16 (App Router), Supabase (Postgres + Auth + Storage), and shadcn/ui. Residents submit stories (text or audio) about their neighbourhood, which admins moderate before publishing.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- No test framework is configured

## Architecture

### Multi-Neighbourhood Routing

The app is multi-tenant via the `[neighbourhood]` dynamic route segment. Each neighbourhood has a slug, accent colour, logo, and settings stored in the `neighbourhoods` table.

- `app/[neighbourhood]/layout.tsx` — Wraps pages in `NeighbourhoodProvider`, injects dynamic CSS variables from the neighbourhood's accent colour
- `components/neighbourhood-context.tsx` — React Context exposing `neighbourhood` object and `href()` helper that prefixes links with the neighbourhood slug
- `lib/colour-utils.ts` — Generates a full HSL palette from a single accent colour; components use `nh-*` utility classes (e.g. `nh-accent`, `nh-bg-light`, `nh-text-dark`)

### Data Layer

- **Supabase client**: `utils/supabase/client.ts` (browser), `utils/supabase/server.ts` (server + service role)
- **Server Actions**: `app/actions/*.ts` — Zod-validated, use `requireAdmin()` guard, return `{ error }` or `{ success: true }`, call `revalidatePath()` for cache invalidation
- **Types**: `types/database.ts` — Full TypeScript interfaces for all tables
- **Migrations**: `supabase/migrations/` — Sequential numbered SQL files (001–009)
- **RLS**: Row-level security on all tables. Admin operations use the service role key to bypass RLS.

### Auth & Middleware

- Supabase Auth with email/password
- `middleware.ts` — Refreshes session, protects `/admin/*` (requires admin role), allows public story submission
- Profiles table extends auth.users with role, avatar, bio, and neighbourhood_id

### Media

- Storage buckets: `story-images` (10MB), `story-audio` (50MB), `story-video` (200MB), `neighbourhood-logos`
- Resumable uploads via tus-js-client
- In-browser audio recording via MediaRecorder API
- `components/media-uploader.tsx`, `components/audio-recorder.tsx`

### Stories

- Two story types: `life_story`, `specific_event`
- Two submission modes: `text`, `audio`
- Status workflow: `pending` → `approved` / `rejected`
- Optional dynamic questions with JSON answers field

### Admin

- `app/admin/` — Dashboard with stats, story moderation queue (tabs by status), question management, FAQ editor, neighbourhood CRUD
- Admin login is separate from user auth flow

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only, bypasses RLS
```

## Conventions

- Path alias: `@/*` maps to project root
- UI primitives live in `components/ui/` (shadcn/ui, base-nova style)
- Icons: lucide-react
- Toasts: sonner
- CSS: Tailwind v4 via `@tailwindcss/postcss`
