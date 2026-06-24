-- Project ERP enterprise extension
-- Run after supabase/full-suite-schema.sql.

create table if not exists public.erp_organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null default '我的公司',
  tax_id text not null default '',
  phone text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.erp_organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'owner',
  display_name text not null default '',
  email text not null default '',
  phone text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.erp_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.erp_organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

alter table public.erp_records add column if not exists organization_id uuid references public.erp_organizations(id) on delete set null;
alter table public.erp_activity add column if not exists organization_id uuid references public.erp_organizations(id) on delete set null;

create index if not exists erp_records_org_module_idx on public.erp_records (organization_id, module, updated_at desc);
create index if not exists erp_activity_org_created_idx on public.erp_activity (organization_id, created_at desc);
create index if not exists erp_members_user_idx on public.erp_members (user_id, organization_id);

alter table public.erp_organizations enable row level security;
alter table public.erp_members enable row level security;
alter table public.erp_settings enable row level security;

drop policy if exists erp_org_owner_all on public.erp_organizations;
drop policy if exists erp_member_self_or_owner on public.erp_members;
drop policy if exists erp_settings_owner on public.erp_settings;

create policy erp_org_owner_all on public.erp_organizations
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy erp_member_self_or_owner on public.erp_members
  for all to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.erp_organizations o
      where o.id = erp_members.organization_id
        and o.owner_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.erp_organizations o
      where o.id = erp_members.organization_id
        and o.owner_id = (select auth.uid())
    )
  );

create policy erp_settings_owner on public.erp_settings
  for all to authenticated
  using (
    exists (
      select 1 from public.erp_organizations o
      where o.id = erp_settings.organization_id
        and o.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.erp_organizations o
      where o.id = erp_settings.organization_id
        and o.owner_id = (select auth.uid())
    )
  );
