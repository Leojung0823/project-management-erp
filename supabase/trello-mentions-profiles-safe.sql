-- Trello mentions and profile mapping safe draft
-- This file only creates optional support tables.
-- It does not switch the live app to strict access mode.

create table if not exists trello_member_profiles (
  id text primary key,
  email text,
  display_name text,
  avatar_url text,
  last_seen_at text,
  created_at text,
  updated_at text
);

create table if not exists trello_mention_notifications (
  id text primary key,
  board_id text,
  card_id text,
  card_title text,
  mentioned_name text,
  mentioned_user_id text,
  mentioned_email text,
  message text,
  created_by text,
  created_by_email text,
  is_read boolean default false,
  created_at text,
  read_at text
);

create index if not exists idx_trello_member_profiles_email
  on trello_member_profiles (email);

create index if not exists idx_trello_mentions_board
  on trello_mention_notifications (board_id, created_at);

create index if not exists idx_trello_mentions_user
  on trello_mention_notifications (mentioned_user_id, is_read, created_at);

create index if not exists idx_trello_mentions_email
  on trello_mention_notifications (mentioned_email, is_read, created_at);
