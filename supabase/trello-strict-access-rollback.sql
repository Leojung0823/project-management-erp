-- Trello strict access rollback draft
-- Use only if a future strict workspace access migration blocks valid users.
-- Current pro-10 release does not require running this file.
-- Safe to re-run.

-- Remove expected strict access policies if a future migration created them.
drop policy if exists erp_records_workspace_select on public.erp_records;
drop policy if exists erp_records_workspace_insert on public.erp_records;
drop policy if exists erp_records_workspace_update on public.erp_records;
drop policy if exists erp_records_workspace_delete on public.erp_records;

drop policy if exists erp_activity_workspace_select on public.erp_activity;
drop policy if exists erp_activity_workspace_insert on public.erp_activity;

-- Keep row level security enabled. Rollback should restore compatibility policies,
-- not disable table protection entirely.
alter table public.erp_records enable row level security;
alter table public.erp_activity enable row level security;

-- Restore owner-based compatibility policies if they are missing.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_select'
  ) then
    create policy erp_records_owner_select on public.erp_records
      for select to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_insert'
  ) then
    create policy erp_records_owner_insert on public.erp_records
      for insert to authenticated
      with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_update'
  ) then
    create policy erp_records_owner_update on public.erp_records
      for update to authenticated
      using ((select auth.uid()) = owner_id)
      with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_records' and policyname = 'erp_records_owner_delete'
  ) then
    create policy erp_records_owner_delete on public.erp_records
      for delete to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_activity' and policyname = 'erp_activity_owner_select'
  ) then
    create policy erp_activity_owner_select on public.erp_activity
      for select to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'erp_activity' and policyname = 'erp_activity_owner_insert'
  ) then
    create policy erp_activity_owner_insert on public.erp_activity
      for insert to authenticated
      with check ((select auth.uid()) = owner_id);
  end if;
end
$$;

-- Optional audit query for manual SQL Editor review.
-- select schemaname, tablename, policyname, cmd from pg_policies where schemaname = 'public' and tablename in ('erp_records','erp_activity') order by tablename, policyname;
