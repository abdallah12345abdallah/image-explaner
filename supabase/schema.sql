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
  default_lead_minutes integer    not null default 30,   -- synced app setting
  created_at          timestamptz not null default now()
);

-- For projects created before this column existed: add it idempotently.
alter table public.profiles
  add column if not exists default_lead_minutes integer not null default 30;

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


-- ----------------------------------------------------------------------------
-- 3) STORAGE — private bucket for history thumbnails.
--    Thumbnails are stored as files (not base64 in the DB) at the path
--    `<user_id>/<history_id>.jpg`. The bucket is private; the app reads them
--    through short-lived signed URLs. RLS restricts every user to their own
--    folder.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('history-thumbnails', 'history-thumbnails', false)
  on conflict (id) do nothing;

-- A user may read/write/delete only files under a folder named after their uid.
drop policy if exists "history_thumbs_select_own" on storage.objects;
create policy "history_thumbs_select_own" on storage.objects
  for select using (
    bucket_id = 'history-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "history_thumbs_insert_own" on storage.objects;
create policy "history_thumbs_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'history-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "history_thumbs_update_own" on storage.objects;
create policy "history_thumbs_update_own" on storage.objects
  for update using (
    bucket_id = 'history-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "history_thumbs_delete_own" on storage.objects;
create policy "history_thumbs_delete_own" on storage.objects
  for delete using (
    bucket_id = 'history-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ----------------------------------------------------------------------------
-- 4) ACCOUNT DELETION — let a logged-in user erase their own account + data.
--    The anon key can't touch auth.users directly, so we expose a SECURITY
--    DEFINER function that deletes the *current* user. Profiles / appointments
--    / history rows are removed by their `on delete cascade` foreign keys; the
--    user's thumbnail files are removed explicitly first.
-- ----------------------------------------------------------------------------
create or replace function public.delete_user()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Remove this user's thumbnail files (storage isn't covered by the cascade).
  delete from storage.objects
  where bucket_id = 'history-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text;

  -- Deleting the auth user cascades to profiles / appointments / history.
  delete from auth.users where id = auth.uid();
end;
$$;

-- Allow logged-in users to call it (and only for themselves — it uses auth.uid()).
revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
