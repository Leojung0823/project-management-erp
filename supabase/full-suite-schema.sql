-- Project Management ERP full-suite schema
-- Run after supabase/schema.sql.

create table if not exists public.erp_records (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  module text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists erp_records_owner_module_idx
  on public.erp_records (owner_id, module, updated_at desc);

create table if not exists public.erp_activity (
  id text primary key,
  owner_id uuid not null default auth.uid(),
  module text not null default '',
  record_id text not null default '',
  action text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists erp_activity_owner_created_idx
  on public.erp_activity (owner_id, created_at desc);

alter table public.erp_records enable row level security;
alter table public.erp_activity enable row level security;

create policy "erp_records_owner_select" on public.erp_records for select to authenticated using ((select auth.uid()) = owner_id);
create policy "erp_records_owner_insert" on public.erp_records for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "erp_records_owner_update" on public.erp_records for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "erp_records_owner_delete" on public.erp_records for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "erp_activity_owner_select" on public.erp_activity for select to authenticated using ((select auth.uid()) = owner_id);
create policy "erp_activity_owner_insert" on public.erp_activity for insert to authenticated with check ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger erp_records_set_updated_at before update on public.erp_records
for each row execute function public.set_updated_at();
