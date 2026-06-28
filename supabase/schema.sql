-- ============================================================================
-- Wuduh — Supabase schema
-- Run this once in your Supabase project:  Dashboard → SQL Editor → New query →
-- paste this whole file → Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) PROFILES — extra fields collected at sign-up (auth.users holds the email).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  name                text,
  nationality         text,
  phone               text,
  accepted_privacy    boolean     not null default false,
  accepted_privacy_at timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can only see / change their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create the profile row when a user signs up, copying the metadata the
-- app sends (name / nationality / phone / accepted_privacy).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, nationality, phone, accepted_privacy, accepted_privacy_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'nationality',
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'accepted_privacy')::boolean, false),
    case when (new.raw_user_meta_data ->> 'accepted_privacy')::boolean then now() else null end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 2) PHASE 2 — per-user data sync (appointments + history).
--    Tables are ready now; the app still reads/writes local storage until we
--    wire the stores to Supabase. Safe to create ahead of time.
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text,
  location     text,
  appt_at      timestamptz,
  lead_minutes integer,
  payload      jsonb,            -- full client record, for forward-compat
  created_at   timestamptz not null default now()
);
alter table public.appointments enable row level security;

drop policy if exists "appointments_own" on public.appointments;
create policy "appointments_own" on public.appointments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists appointments_user_idx on public.appointments (user_id, appt_at);

create table if not exists public.history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  payload     jsonb,            -- the analysis result returned by /api/explain
  created_at  timestamptz not null default now()
);
alter table public.history enable row level security;

drop policy if exists "history_own" on public.history;
create policy "history_own" on public.history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists history_user_idx on public.history (user_id, created_at desc);
