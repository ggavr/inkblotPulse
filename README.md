# Inkblot Pulse

A feed of book excerpts built on Next.js 15 (App Router), Supabase (Postgres + Auth), and Vercel.

## Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **Supabase** — Postgres database, Auth, Row Level Security
- **Vercel** — hosting + edge middleware
- **TypeScript** — strict mode
- **Zod** — input validation

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at https://supabase.com.
2. From **Settings → API**, copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run migrations

Apply the SQL files in `supabase/migrations/` in order. Easiest options:

- **Supabase dashboard**: open the SQL editor and paste each file in order (`0001_schema.sql`, `0002_rls.sql`, `0003_seed.sql`).
- **Supabase CLI**:

```bash
supabase db push
```

### 4. Create your first admin user

1. Start the app (`npm run dev`) and sign up at `/auth/sign-up`.
2. Confirm your email (check the Supabase Auth dashboard).
3. In the Supabase SQL editor, promote your account:

```sql
update profiles set is_admin = true where id = (
  select id from auth.users where email = 'you@example.com'
);
```

4. Reload the app — the **Admin** tab should appear.

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo on Vercel.
3. Add the environment variables from `.env.local` to the Vercel project (set `NEXT_PUBLIC_SITE_URL` to your production URL).
4. In **Supabase → Authentication → URL Configuration**, add your Vercel URL to **Site URL** and **Redirect URLs** (`https://yourdomain.com/auth/callback`).

## Project layout

```
app/
  actions/        Server Actions (engagement, admin, auth)
  admin/          Admin pages (RLS-guarded + server-side requireAdmin)
  auth/           Sign in / sign up / OAuth callback
  book/[id]/      Book detail page
  bookmarks/      Saved excerpts
  page.tsx        Feed
  layout.tsx      Root layout, metadata, TabBar, Toaster
components/       Client + server components
lib/
  supabase/       Browser + server + middleware clients
  data.ts         Server-only data fetchers
  auth.ts         getCurrentUser / requireAdmin
  validation.ts   Zod schemas
  url.ts          https-only URL sanitizer
supabase/
  migrations/     Schema, RLS, seed SQL
middleware.ts     Supabase session refresh
next.config.mjs   CSP + security headers
```

## Security notes

- **XSS via buy link** — `lib/url.ts` rejects anything that is not `https://`. Used on both client (before `window.open`) and server (Zod validator).
- **Authorization** — every admin write goes through `requireAdmin()` server-side and is also enforced by Postgres RLS using `is_admin()`.
- **Atomic counters** — likes/views/wants run through `SECURITY DEFINER` RPCs so concurrent writes cannot lose updates.
- **CSP** — see `next.config.mjs`. Locks scripts to self, blocks iframes (`frame-ancestors 'none'`), allows only Supabase for data.
- **Input validation** — Zod schemas on all Server Actions; Postgres `CHECK` constraints as a second line of defense.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve prod build
npm run lint     # next lint
```
