-- Harden SELECT policy on web_vitals to be least-privilege
-- Drop existing broad read policy and replace with per-user policy

-- Ensure table exists (no-op if already created by previous migration)
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

alter table public.web_vitals enable row level security;

-- Drop previous policies if present
drop policy if exists "Authenticated can read web vitals" on public.web_vitals;

-- Create stricter SELECT policy: users can only read their own rows
create policy "Users can read their own web vitals"
  on public.web_vitals
  for select
  to authenticated
  using (
    user_id is not null and user_id = auth.uid()
  );

-- Keep insert policy as previously created (allow null user_id during ingestion if authenticated)
-- Recreate only if missing
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'web_vitals'
      and policyname = 'Authenticated can insert own web vitals'
  ) then
    create policy "Authenticated can insert own web vitals"
      on public.web_vitals
      for insert
      to authenticated
      with check (
        (user_id is null) or (user_id = auth.uid())
      );
  end if;
end $$;

-- Helpful indexes (idempotent)
create index if not exists web_vitals_created_at_idx on public.web_vitals (created_at desc);
create index if not exists web_vitals_user_id_idx on public.web_vitals (user_id);
create index if not exists web_vitals_session_id_idx on public.web_vitals (session_id);
create index if not exists web_vitals_pathname_idx on public.web_vitals (pathname);
create index if not exists web_vitals_metric_idx on public.web_vitals (metric);
create index if not exists web_vitals_path_metric_created_idx on public.web_vitals (pathname, metric, created_at desc);

comment on table public.web_vitals is 'Client web-vitals with RLS: SELECT limited to row owner; authenticated INSERT allows user_id null for early capture.';