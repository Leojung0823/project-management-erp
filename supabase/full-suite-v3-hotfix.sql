-- Project ERP Full Suite v3 hotfix
-- Fix column mismatch between current front-end app and database schema.

alter table if exists public.erp_records
  alter column title drop not null;

alter table if exists public.erp_records
  alter column title set default '';

alter table if exists public.erp_activity
  add column if not exists module text;

alter table if exists public.erp_activity
  add column if not exists note text;

create index if not exists erp_activity_module_idx on public.erp_activity(module);

-- Backfill note from message when the original schema used message.
update public.erp_activity
set note = coalesce(note, message)
where note is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'erp_activity'
      and column_name = 'message'
  );
