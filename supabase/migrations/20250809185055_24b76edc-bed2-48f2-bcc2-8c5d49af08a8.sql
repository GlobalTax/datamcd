-- Create table to store Web Vitals metrics
create table if not exists public.web_vitals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  session_id text not null,
  pathname text not null,
  metric text not null,
  value double precision null,
  rating text null,
  delta double precision null,
  navigation_type text null,
  label text null,
  detail jsonb null
);

-- Optional FK to auth.users (kept nullable for anonymous inserts if ever needed)
alter table public.web_vitals
  drop constraint if exists web_vitals_user_id_fkey;

alter table public.web_vitals
  add constraint web_vitals_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete set null;

-- Enable Row Level Security
alter table public.web_vitals enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Authenticated can insert own web vitals" on public.web_vitals;
drop policy if exists "Authenticated can read web vitals" on public.web_vitals;

-- Insert policy: allow authenticated users to insert; accept null user_id (client may insert before user is resolved)
create policy "Authenticated can insert own web vitals"
  on public.web_vitals
  for insert
  to authenticated
  with check (
    (user_id is null) or (user_id = auth.uid())
  );

-- Select policy: allow authenticated users to read (adjust later if stricter scoping is required)
create policy "Authenticated can read web vitals"
  on public.web_vitals
  for select
  to authenticated
  using (true);

-- Useful indexes for querying/aggregation
create index if not exists web_vitals_created_at_idx on public.web_vitals (created_at desc);
create index if not exists web_vitals_user_id_idx on public.web_vitals (user_id);
create index if not exists web_vitals_session_id_idx on public.web_vitals (session_id);
create index if not exists web_vitals_pathname_idx on public.web_vitals (pathname);
create index if not exists web_vitals_metric_idx on public.web_vitals (metric);
create index if not exists web_vitals_path_metric_created_idx on public.web_vitals (pathname, metric, created_at desc);
