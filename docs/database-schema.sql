-- Project Management ERP PostgreSQL / Supabase starter schema
-- 建議先在測試專案執行，不要直接套用到正式資料庫。

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  phone text,
  email text,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  client_id uuid references clients(id) on delete set null,
  manager_id uuid,
  budget numeric(14, 2) not null default 0,
  cost numeric(14, 2) not null default 0,
  status text not null default 'planning' check (status in ('planning', 'active', 'risk', 'paused', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title text not null,
  description text,
  owner_id uuid,
  status text not null default 'todo' check (status in ('todo', 'doing', 'review', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_date date,
  estimate_hours numeric(8, 2) not null default 0,
  actual_hours numeric(8, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  amount numeric(14, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_client_id on projects(client_id);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_tasks_project_id on tasks(project_id);
create index if not exists idx_tasks_status_due_date on tasks(status, due_date);
create index if not exists idx_invoices_project_id on invoices(project_id);
create index if not exists idx_invoices_status_due_date on invoices(status, due_date);
