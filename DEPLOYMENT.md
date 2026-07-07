# Deploying to Vercel

This project is a standard Next.js 14 App Router app and deploys to Vercel
with no special configuration beyond environment variables.

## 1. Push to a Git repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the
   repository.
2. Framework preset should auto-detect as **Next.js** — leave build
   command (`next build`) and output directory as default.
3. Before the first deploy, add environment variables (see below).

## 3. Environment Variables

In **Project Settings → Environment Variables**, add every key from
[`.env.example`](./.env.example) with your real values, for both
**Production** and **Preview** environments:

| Variable                            | Where to find it                                   |
| ------------------------------------ | --------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`            | Supabase → Project Settings → API                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | Supabase → Project Settings → API                  |
| `SUPABASE_SERVICE_ROLE_KEY`           | Supabase → Project Settings → API (keep secret)     |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   | Cloudinary Dashboard                                |
| `CLOUDINARY_API_KEY`                  | Cloudinary Dashboard                                |
| `CLOUDINARY_API_SECRET`               | Cloudinary Dashboard (keep secret)                  |
| `CLOUDINARY_UPLOAD_FOLDER`            | Any folder name, e.g. `shammaq-portfolio`           |
| `NEXT_PUBLIC_SITE_URL`                | Your production domain, e.g. `https://shammaqbinfaisal.com` |
| `OWNER_EMAIL`                         | The email of the Supabase Auth user you'll sign in with |

Variables prefixed `NEXT_PUBLIC_` are exposed to the browser — never put
secrets there. `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` stay
server-only and are only read inside Route Handlers.

## 4. Run the database migration

Before or right after your first deploy, open the Supabase SQL Editor and
run [`supabase/schema.sql`](./supabase/schema.sql) once. This is idempotent
— safe to re-run if you need to reapply policies later.

## 5. Create the owner account

In Supabase → **Authentication → Users → Add user**, create the single
owner account with a real email and password. Make sure:

- `OWNER_EMAIL` in Vercel matches that email exactly.
- The email inside `public.is_owner()` in `supabase/schema.sql` matches
  too (re-run that function block in the SQL editor if you change it).

## 6. Deploy

Click **Deploy**. Vercel will build and deploy automatically on every
push to `main` (production) and every pull request (preview).

## 7. Custom Domain

In **Project Settings → Domains**, add your domain and follow Vercel's DNS
instructions (either an `A`/`ALIAS` record or `CNAME`, depending on
whether it's an apex domain or subdomain). Update `NEXT_PUBLIC_SITE_URL`
to match once the domain is live, so metadata, the sitemap, and Open Graph
tags point at the right place.

## 8. Post-deploy checklist

- [ ] Visit `/` — hero loads, category grid shows real photos once
      uploaded.
- [ ] Visit `/login` and sign in as the owner.
- [ ] Visit `/admin/upload` and upload a test photo — confirm it appears
      in Cloudinary's Media Library and in Supabase's `photos` table.
- [ ] Visit the relevant `/category/[slug]` page and confirm the photo
      appears publicly (if marked public).
- [ ] Delete the test photo from `/admin` and confirm it's removed from
      both Cloudinary and Supabase.
- [ ] Submit the `/contact` and `/book-now` forms and confirm rows appear
      in the `inquiries` table.
