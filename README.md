# Shammaq Bin Faisal — Photography Portfolio

A premium, cinematic photography portfolio built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, Supabase (Auth + Postgres), and
Cloudinary. Includes a public site, five category portfolios, and an
owner-only admin dashboard for uploading and managing photos.

**This repo ships with demo/dummy content baked in** — real Unsplash images,
a dummy `.env.example`, and graceful fallbacks — so it runs and looks
finished immediately with zero configuration. Follow the steps below to
connect your real Supabase + Cloudinary accounts when you're ready to go
live.

---

## Tech Stack

| Layer          | Choice                                         |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 14 App Router, TypeScript (strict)      |
| Styling         | Tailwind CSS + shadcn/ui-style primitives       |
| Auth & Database | Supabase (Auth for owner login, Postgres + RLS) |
| Image hosting   | Cloudinary (signed browser uploads)             |
| Animation       | Framer Motion (`motion`)                        |
| 3D              | React Three Fiber (procedural aperture/lens)    |
| Testing         | Vitest + Testing Library                        |

## Design System

- **Palette**: near-black (`#0b0b0c`), warm paper white (`#f6f4ef`), charcoal
  (`#17171a`), smoke gray (`#8b8880`), and a champagne gold accent
  (`#c9a869` / `#e8d5a0`) used sparingly (~5% of the UI).
- **Type**: Fraunces (display serif) + Inter (body) + JetBrains Mono
  (labels, eyebrows, captions).
- **Signature element**: a procedurally built 3D camera aperture in the
  hero — built entirely from primitive Three.js geometry (no external model
  files), it opens on load and drifts in a slow ambient rotation.

---

## 1. Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. With the dummy `.env.local` values in place,
the site runs entirely on **demo data** (see `lib/data.ts`): categories,
photos, and forms all work, they just don't persist to a real database or
Cloudinary account yet.

## 2. Connect Real Services

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and **anon
   public key** into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy the **service_role key** into `SUPABASE_SERVICE_ROLE_KEY` (server
   only — never expose this to the browser).
4. Open the **SQL Editor** and run the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This creates the
   `categories`, `photos`, and `inquiries` tables, seeds the five
   categories, and sets up Row Level Security (see below).
5. Update the email inside the `public.is_owner()` function in
   `supabase/schema.sql` (and re-run just that `create or replace function`
   block) to match the owner account you create next.
6. Go to **Authentication → Users → Add user** and create the owner
   account with a real email + password. Set `OWNER_EMAIL` in your env vars
   to that same email.

### Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy your **Cloud name**, **API Key**, and **API
   Secret** into `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   and `CLOUDINARY_API_SECRET`.
3. No upload preset is required — uploads are signed server-side (see
   `lib/cloudinary.ts`) so the API secret never reaches the browser.

Once both are configured with real values (i.e. the URL no longer contains
`dummyproject`), `lib/data.ts` automatically switches from demo data to live
Supabase queries — no code changes needed.

## 3. Row Level Security

All access control lives in Postgres, enforced by Supabase RLS policies
defined in `supabase/schema.sql`:

- **Categories**: readable by anyone; writable only by the owner.
- **Photos**: rows with `is_public = true` are readable by anyone; the
  owner can read everything (including hidden photos) and is the only
  one who can insert, update, or delete.
- **Inquiries** (contact/booking submissions): anyone can insert; only the
  owner can read them back.

Ownership is determined by the `public.is_owner()` SQL function, which
checks the current authenticated user's email against a hardcoded owner
email. API routes also perform a defense-in-depth check via
`lib/auth.ts#requireOwner`, but RLS is the actual source of truth — even a
misconfigured API route cannot bypass it.

## 4. Project Structure

```
app/
  page.tsx                 Home (hero + category grid)
  about/, contact/, book-now/
  category/[slug]/         Public portfolio pages per category
  login/                   Owner login
  admin/                   Owner-only dashboard + upload (protected by middleware.ts)
  api/                     Route handlers (contact, booking, upload, delete, cloudinary-sign)
components/
  nav/, hero/, categories/, gallery/, forms/, admin/, ui/, shared/
lib/
  data.ts                  Data access + demo-data fallback
  supabase/                Browser/server/middleware Supabase clients + types
  cloudinary.ts            Signed upload + delete + URL optimization
  validations.ts           Zod schemas shared by forms and API routes
  auth.ts                  requireOwner() guard for protected API routes
supabase/schema.sql         Full schema, RLS policies, and seed data
__tests__/                  Vitest suite (validation, auth, Cloudinary, RLS, delete flow)
```

## 5. Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers: form/upload validation schemas, the owner-authorization guard,
Cloudinary signature generation, demo-data fallback + search, the delete
API route (Cloudinary + Supabase cleanup, unauthorized/not-found paths),
and static assertions that `supabase/schema.sql` defines the required RLS
policies.

## 6. Build

```bash
npm run typecheck   # tsc --noEmit, strict mode
npm run lint
npm run build
```

## 7. Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step Vercel deployment
instructions.

---

## Notes & Known Trade-offs

- `middleware.ts` imports `@supabase/ssr`, which pulls in the full
  `@supabase/supabase-js` client. Next.js prints a harmless build-time
  warning about a Node API (`process.version`) not being supported in the
  Edge Runtime — this does not affect functionality since the middleware
  still runs correctly, but if you later want a zero-warning build on the
  Edge runtime specifically, swap to a lighter JWT-only session check in
  middleware and keep the full client only in Route Handlers.
- Demo mode (`lib/data.ts`) is intentionally permissive so the site is
  fully browsable without any credentials. Once real env vars are set, all
  fallback paths are bypassed automatically.
