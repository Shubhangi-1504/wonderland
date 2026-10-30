-- MONEYVERSE schema. Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run: tables/policies/trigger are created idempotently.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  xp int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  cash numeric not null default 10000,
  holdings jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  mission_id text not null,
  completed boolean not null default false,
  quiz_score int,
  primary key (user_id, mission_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security: a row is only ever visible/writable by its owner.
-- A single FOR ALL policy covers select/insert/update/delete.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.mission_progress enable row level security;

drop policy if exists "profiles_own_rows" on public.profiles;
create policy "profiles_own_rows" on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "portfolios_own_rows" on public.portfolios;
create policy "portfolios_own_rows" on public.portfolios
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "mission_progress_own_rows" on public.mission_progress;
create policy "mission_progress_own_rows" on public.mission_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete
  on public.profiles, public.portfolios, public.mission_progress
  to authenticated;

-- ---------------------------------------------------------------------------
-- New auth user -> profiles + portfolios rows.
-- display_name comes from signUp options.data.display_name, else the email prefix.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.portfolios (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
