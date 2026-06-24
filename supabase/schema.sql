-- Project Management ERP Supabase schema
-- Run this in Supabase Dashboard → SQL Editor.
-- This MVP uses anonymous Supabase Auth users plus RLS.
-- Enable anonymous sign-ins in Authentication settings before using cloud sync.

create table if not exists public.clients (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  name text not null,
  contact text not null default '',
  phone text not null default '',
  email text not null default '',
  industry text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  code text not null,
  name text not null,
  client_id text not null default '',
  manager text not null default '',
  budget numeric not null default 0,
  cost numeric not null default 0,
  status text not null default 'planning' check (status in ('planning','active','risk','paused','done')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  deadline date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  project_id text not null default '',
  title text not null,
  owner text not null default '',
  status text not null default 'todo' check (status in ('todo','doing','review','done')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  due_date date not null default current_date,
  estimate_hours numeric not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  project_id text not null default '',
  title text not null,
  amount numeric not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  due_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;

create policy "clients_owner_select" on public.clients
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "clients_owner_insert" on public.clients
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "clients_owner_update" on public.clients
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "clients_owner_delete" on public.clients
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "projects_owner_select" on public.projects
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "projects_owner_insert" on public.projects
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "projects_owner_update" on public.projects
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "projects_owner_delete" on public.projects
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "tasks_owner_select" on public.tasks
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "tasks_owner_insert" on public.tasks
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "tasks_owner_update" on public.tasks
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "tasks_owner_delete" on public.tasks
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "invoices_owner_select" on public.invoices
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "invoices_owner_insert" on public.invoices
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "invoices_owner_update" on public.invoices
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "invoices_owner_delete" on public.invoices
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();
