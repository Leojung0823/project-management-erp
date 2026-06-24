-- Trello Phase 11 — automation and notification tables
-- Safe to run multiple times.

create table if not exists public.trello_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  board_id text not null,
  card_id text,
  user_id uuid,
  title text not null,
  body text default '',
  type text default 'info',
  severity text default 'good',
  is_read boolean default false,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.trello_automation_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  board_id text not null,
  name text not null,
  type text not null,
  enabled boolean default true,
  config jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trello_automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid,
  board_id text not null,
  status text default 'ok',
  summary text default '',
  changed_count int default 0,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_trello_notifications_board on public.trello_notifications(board_id, created_at desc);
create index if not exists idx_trello_notifications_user_read on public.trello_notifications(user_id, is_read, created_at desc);
create index if not exists idx_trello_automation_rules_board on public.trello_automation_rules(board_id, enabled);
create index if not exists idx_trello_automation_runs_board on public.trello_automation_runs(board_id, created_at desc);

alter table public.trello_notifications enable row level security;
alter table public.trello_automation_rules enable row level security;
alter table public.trello_automation_runs enable row level security;

-- Compatibility policies: authenticated/anonymous users can use records while strict workspace access is still in dry-run mode.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_notifications' and policyname='trello_notifications_compat_read') then
    create policy trello_notifications_compat_read on public.trello_notifications for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_notifications' and policyname='trello_notifications_compat_write') then
    create policy trello_notifications_compat_write on public.trello_notifications for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_notifications' and policyname='trello_notifications_compat_update') then
    create policy trello_notifications_compat_update on public.trello_notifications for update using (true) with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_automation_rules' and policyname='trello_automation_rules_compat_read') then
    create policy trello_automation_rules_compat_read on public.trello_automation_rules for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_automation_rules' and policyname='trello_automation_rules_compat_write') then
    create policy trello_automation_rules_compat_write on public.trello_automation_rules for all using (true) with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_automation_runs' and policyname='trello_automation_runs_compat_read') then
    create policy trello_automation_runs_compat_read on public.trello_automation_runs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_automation_runs' and policyname='trello_automation_runs_compat_write') then
    create policy trello_automation_runs_compat_write on public.trello_automation_runs for insert with check (true);
  end if;
end $$;
