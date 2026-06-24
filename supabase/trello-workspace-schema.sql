-- Trello workspace schema for Project ERP
-- Safe to re-run. This prepares real workspace/member/board role tables.

create table if not exists public.trello_workspaces (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  name text not null default 'Workspace',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trello_workspace_members (
  id text primary key,
  workspace_id text not null references public.trello_workspaces(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  user_id uuid,
  email text not null default '',
  display_name text not null default '',
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trello_workspace_members_role_check check (role in ('owner','admin','member','viewer')),
  constraint trello_workspace_members_status_check check (status in ('active','pending','disabled'))
);

create table if not exists public.trello_board_members (
  id text primary key,
  workspace_id text not null references public.trello_workspaces(id) on delete cascade,
  board_id text not null,
  owner_id uuid not null default auth.uid(),
  email text not null default '',
  display_name text not null default '',
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trello_board_members_role_check check (role in ('owner','admin','member','viewer')),
  constraint trello_board_members_status_check check (status in ('active','pending','disabled'))
);

create table if not exists public.trello_due_notifications (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  workspace_id text not null default '',
  board_id text not null default '',
  card_id text not null default '',
  due_date date,
  reminder_type text not null default 'due_soon',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists trello_workspaces_owner_idx on public.trello_workspaces(owner_id, updated_at desc);
create index if not exists trello_workspace_members_workspace_idx on public.trello_workspace_members(workspace_id, role, status);
create index if not exists trello_board_members_board_idx on public.trello_board_members(board_id, role, status);
create index if not exists trello_due_notifications_lookup_idx on public.trello_due_notifications(owner_id, board_id, card_id, due_date);

alter table public.trello_workspaces enable row level security;
alter table public.trello_workspace_members enable row level security;
alter table public.trello_board_members enable row level security;
alter table public.trello_due_notifications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_workspaces' and policyname='trello_workspaces_owner_all') then
    create policy trello_workspaces_owner_all on public.trello_workspaces for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_workspace_members' and policyname='trello_workspace_members_owner_all') then
    create policy trello_workspace_members_owner_all on public.trello_workspace_members for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_board_members' and policyname='trello_board_members_owner_all') then
    create policy trello_board_members_owner_all on public.trello_board_members for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trello_due_notifications' and policyname='trello_due_notifications_owner_all') then
    create policy trello_due_notifications_owner_all on public.trello_due_notifications for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
  end if;
end
$$;

create or replace function public.trello_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trello_workspaces_set_updated_at on public.trello_workspaces;
create trigger trello_workspaces_set_updated_at before update on public.trello_workspaces for each row execute function public.trello_set_updated_at();

drop trigger if exists trello_workspace_members_set_updated_at on public.trello_workspace_members;
create trigger trello_workspace_members_set_updated_at before update on public.trello_workspace_members for each row execute function public.trello_set_updated_at();

drop trigger if exists trello_board_members_set_updated_at on public.trello_board_members;
create trigger trello_board_members_set_updated_at before update on public.trello_board_members for each row execute function public.trello_set_updated_at();
