-- INFRA701 CMS + lead inbox
create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
create policy "Admins can read admin roster" on public.site_admins for select to authenticated
using (public.is_site_admin());

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.site_admins where user_id = auth.uid()); $$;

create table if not exists public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) <= 254),
  phone text check (char_length(coalesce(phone,'')) <= 40),
  service text not null check (char_length(service) <= 120),
  preferred_contact text check (preferred_contact in ('Email','Phone','Either')),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new','contacted','qualified','converted','closed','spam')),
  admin_notes text not null default '',
  source text not null default 'website'
);
create index if not exists lead_submissions_created_at_idx on public.lead_submissions(created_at desc);
create index if not exists lead_submissions_status_idx on public.lead_submissions(status);
alter table public.lead_submissions enable row level security;
create policy "Public can submit a lead" on public.lead_submissions for insert to anon, authenticated
with check (status = 'new' and admin_notes = '' and source = 'website');
create policy "Admins can read leads" on public.lead_submissions for select to authenticated using (public.is_site_admin());
create policy "Admins can update leads" on public.lead_submissions for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
create policy "Admins can delete leads" on public.lead_submissions for delete to authenticated using (public.is_site_admin());

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  label text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.site_content enable row level security;
create policy "Public can read published content" on public.site_content for select to anon, authenticated using (true);
create policy "Admins can insert content" on public.site_content for insert to authenticated with check (public.is_site_admin());
create policy "Admins can update content" on public.site_content for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
create policy "Admins can delete content" on public.site_content for delete to authenticated using (public.is_site_admin());

-- After creating your admin account in Supabase Auth, run:
-- insert into public.site_admins (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
