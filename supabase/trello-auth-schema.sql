-- Trello auth foundation for PM ERP
-- Safe draft version. Run this before enabling the Phase 6 account panel.
-- Strict row security should be added only after every active user can sign in.

create table if not exists public.trello_user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trello_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  event_type text not null default 'signin',
  created_at timestamptz default now()
);

create index if not exists trello_user_profiles_user_id_idx on public.trello_user_profiles(user_id);
create index if not exists trello_user_profiles_email_idx on public.trello_user_profiles(email);
create index if not exists trello_login_events_user_id_idx on public.trello_login_events(user_id);
