-- Project Management ERP full-suite schema
-- Run after supabase/schema.sql.
-- This file is designed to be safe to re-run in Supabase SQL Editor.

create table if not exists public.erp_records (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  module text not null,
  title text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_records
  add column if not exists owner_id uuid not null default auth.uid(),
  add column if not exists module text not null default '',
  add column if not exists title text not null default '',
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists erp_records_owner_module_idx
  on public.erp_records (owner_id, module, updated_at desc);

create table if not exists public.erp_activity (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  module text not null default '',
  record_id text not null default '',
  action text not null default '',
  note text not null default '',
  message text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.erp_activity
  add column if not exists owner_id uuid not null default auth.uid(),
  add column if not exists module text not null default '',
  add column if not exists record_id text not null default '',
  add column if not exists action text not null default '',
  add column if not exists note text not null default '',
  add column if not exists message text not null default '',
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists erp_activity_owner_created_idx
  on public.erp_activity (owner_id, created_at desc);

create index if not exists erp_activity_module_idx
  on public.erp_activity (module);

alter table public.erp_records enable row level security;
alter table public.erp_activity enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_select') then
    create policy erp_records_owner_select on public.erp_records for select to authenticated using ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_insert') then
    create policy erp_records_owner_insert on public.erp_records for insert to authenticated with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_update') then
    create policy erp_records_owner_update on public.erp_records for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_delete') then
    create policy erp_records_owner_delete on public.erp_records for delete to authenticated using ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_activity' and policyname = 'erp_activity_owner_select') then
    create policy erp_activity_owner_select on public.erp_activity for select to authenticated using ((select auth.uid()) = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'erp_activity' and policyname = 'erp_activity_owner_insert') then
    create policy erp_activity_owner_insert on public.erp_activity for insert to authenticated with check ((select auth.uid()) = owner_id);
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists erp_records_set_updated_at on public.erp_records;

create trigger erp_records_set_updated_at
before update on public.erp_records
for each row execute function public.set_updated_at();

update public.erp_activity
set note = coalesce(nullif(note, ''), message)
where note = '' and message <> '';

update public.erp_activity
set message = coalesce(nullif(message, ''), note)
where message = '' and note <> '';
