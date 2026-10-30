-- MONEYVERSE product analytics. Paste into the Supabase SQL editor and run once.
-- Safe to re-run: table/policy/index are created idempotently.
--
-- Design: clients may INSERT only. There is deliberately NO select policy, so
-- nobody can read event rows with the anon key (read them in the dashboard/SQL
-- editor, or with the service role, which bypasses RLS).

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  -- null for guests; set automatically from the session when logged in
  user_id uuid default auth.uid(),
  anon_id text,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Start from no client privileges, then grant insert only.
revoke all on public.events from anon, authenticated;
grant insert on public.events to anon, authenticated;

drop policy if exists "events_insert_only" on public.events;
create policy "events_insert_only" on public.events
  for insert
  to anon, authenticated
  with check (true);

create index if not exists events_name_created_idx on public.events (name, created_at desc);
create index if not exists events_anon_idx on public.events (anon_id);
