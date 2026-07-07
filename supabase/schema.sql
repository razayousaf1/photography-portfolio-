-- =============================================================================
-- Shammaq Bin Faisal Photography — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE where possible.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  title text not null,
  description text,
  cloudinary_url text not null,
  cloudinary_public_id text not null,
  is_featured boolean not null default false,
  is_public boolean not null default true,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photos_category_id_idx on public.photos (category_id);
create index if not exists photos_is_public_idx on public.photos (is_public);
create index if not exists photos_is_featured_idx on public.photos (is_featured);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'booking')),
  name text not null,
  email text not null,
  phone text,
  event_type text,
  event_date date,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger for photos
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at
  before update on public.photos
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Owner check helper
--    The single owner account is identified by email. Update the email
--    below (or set it via the OWNER_EMAIL env var mirrored into this
--    function) to match the Supabase Auth user you create for the owner.
-- ---------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean as $$
  select exists (
    select 1
    from auth.users
    where auth.users.id = auth.uid()
      and auth.users.email = 'shammaq12@gmail.com'
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.photos enable row level security;
alter table public.inquiries enable row level security;

-- Categories: readable by everyone, writable only by the owner.
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories for select
  using (true);

drop policy if exists "categories_write_owner" on public.categories;
create policy "categories_write_owner"
  on public.categories for all
  using (public.is_owner())
  with check (public.is_owner());

-- Photos: public rows readable by anyone; owner can read/write everything.
drop policy if exists "photos_select_public" on public.photos;
create policy "photos_select_public"
  on public.photos for select
  using (is_public = true or public.is_owner());

drop policy if exists "photos_insert_owner" on public.photos;
create policy "photos_insert_owner"
  on public.photos for insert
  with check (public.is_owner());

drop policy if exists "photos_update_owner" on public.photos;
create policy "photos_update_owner"
  on public.photos for update
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "photos_delete_owner" on public.photos;
create policy "photos_delete_owner"
  on public.photos for delete
  using (public.is_owner());

-- Inquiries: anyone can insert (contact/booking forms); only the owner can read.
drop policy if exists "inquiries_insert_anyone" on public.inquiries;
create policy "inquiries_insert_anyone"
  on public.inquiries for insert
  with check (true);

drop policy if exists "inquiries_select_owner" on public.inquiries;
create policy "inquiries_select_owner"
  on public.inquiries for select
  using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 6. Seed categories (idempotent)
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug)
values
  ('Fashion', 'fashion'),
  ('Product', 'product'),
  ('Corporate', 'corporate'),
  ('Weddings', 'weddings'),
  ('Commercial', 'commercial')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 7. Creating the owner account
--    Run this separately in Supabase Auth → Users → "Add user", or via the
--    Admin API. Then make sure the email matches public.is_owner() above.
--    Example (Supabase CLI / SQL is not used for auth.users directly —
--    use the Dashboard or supabase.auth.admin.createUser on the server).
-- ---------------------------------------------------------------------------
