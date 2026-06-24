import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppStore, Client, Invoice, InvoiceStatus, Priority, Project, ProjectStatus, Task, TaskStatus } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = hasSupabaseEnv ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

export type SyncMode = 'local' | 'cloud';

type ClientRow = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  industry: string;
};

type ProjectRow = {
  id: string;
  code: string;
  name: string;
  client_id: string;
  manager: string;
  budget: number | string;
  cost: number | string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  deadline: string;
  notes: string;
};

type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string;
  estimate_hours: number | string;
};

type InvoiceRow = {
  id: string;
  project_id: string;
  title: string;
  amount: number | string;
  status: InvoiceStatus;
  due_date: string;
};

function getClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('尚未設定 Supabase 環境變數。');
  }
  return supabase;
}

async function ensureSession(client: SupabaseClient) {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data, error } = await client.auth.signInAnonymously();
  if (error) {
    throw new Error(`匿名登入失敗：${error.message}。請確認 Supabase 已啟用 Anonymous Sign-Ins。`);
  }
  if (!data.session) {
    throw new Error('匿名登入沒有取得 session。');
  }
  return data.session;
}

function normalizeDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function numberValue(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    industry: row.industry ?? ''
  };
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    clientId: row.client_id,
    manager: row.manager ?? '',
    budget: numberValue(row.budget),
    cost: numberValue(row.cost),
    status: row.status,
    priority: row.priority,
    progress: Number(row.progress ?? 0),
    deadline: normalizeDate(row.deadline),
    notes: row.notes ?? ''
  };
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    owner: row.owner ?? '',
    status: row.status,
    priority: row.priority,
    dueDate: normalizeDate(row.due_date),
    estimateHours: numberValue(row.estimate_hours)
  };
}

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    amount: numberValue(row.amount),
    status: row.status,
    dueDate: normalizeDate(row.due_date)
  };
}

function fromClient(client: Client) {
  return {
    id: client.id,
    name: client.name,
    contact: client.contact,
    phone: client.phone,
    email: client.email,
    industry: client.industry
  };
}

function fromProject(project: Project) {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    client_id: project.clientId,
    manager: project.manager,
    budget: project.budget,
    cost: project.cost,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    deadline: project.deadline,
    notes: project.notes
  };
}

function fromTask(task: Task) {
  return {
    id: task.id,
    project_id: task.projectId,
    title: task.title,
    owner: task.owner,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    estimate_hours: task.estimateHours
  };
}

function fromInvoice(invoice: Invoice) {
  return {
    id: invoice.id,
    project_id: invoice.projectId,
    title: invoice.title,
    amount: invoice.amount,
    status: invoice.status,
    due_date: invoice.dueDate
  };
}

function assertNoError(error: unknown, fallback: string) {
  if (!error) return;
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`${fallback}：${message}`);
}

export function isEmptyStore(store: AppStore) {
  return store.clients.length === 0 && store.projects.length === 0 && store.tasks.length === 0 && store.invoices.length === 0;
}

export async function fetchCloudStore(): Promise<AppStore> {
  const client = getClient();
  await ensureSession(client);

  const [clientsResult, projectsResult, tasksResult, invoicesResult] = await Promise.all([
    client.from('clients').select('id,name,contact,phone,email,industry').order('name', { ascending: true }),
    client.from('projects').select('id,code,name,client_id,manager,budget,cost,status,priority,progress,deadline,notes').order('deadline', { ascending: true }),
    client.from('tasks').select('id,project_id,title,owner,status,priority,due_date,estimate_hours').order('due_date', { ascending: true }),
    client.from('invoices').select('id,project_id,title,amount,status,due_date').order('due_date', { ascending: true })
  ]);

  assertNoError(clientsResult.error, '讀取客戶資料失敗，請確認已執行 supabase/schema.sql');
  assertNoError(projectsResult.error, '讀取專案資料失敗，請確認已執行 supabase/schema.sql');
  assertNoError(tasksResult.error, '讀取任務資料失敗，請確認已執行 supabase/schema.sql');
  assertNoError(invoicesResult.error, '讀取帳款資料失敗，請確認已執行 supabase/schema.sql');

  return {
    clients: (clientsResult.data ?? []).map((row) => toClient(row as ClientRow)),
    projects: (projectsResult.data ?? []).map((row) => toProject(row as ProjectRow)),
    tasks: (tasksResult.data ?? []).map((row) => toTask(row as TaskRow)),
    invoices: (invoicesResult.data ?? []).map((row) => toInvoice(row as InvoiceRow))
  };
}

async function deleteOwnedRows(client: SupabaseClient, table: string, ownerId: string) {
  const { error } = await client.from(table).delete().eq('owner_id', ownerId);
  assertNoError(error, `清除 ${table} 失敗`);
}

async function insertRows(client: SupabaseClient, table: string, rows: unknown[]) {
  if (rows.length === 0) return;
  const { error } = await client.from(table).insert(rows);
  assertNoError(error, `寫入 ${table} 失敗`);
}

export async function replaceCloudStore(store: AppStore): Promise<void> {
  const client = getClient();
  const session = await ensureSession(client);
  const ownerId = session.user.id;

  await deleteOwnedRows(client, 'invoices', ownerId);
  await deleteOwnedRows(client, 'tasks', ownerId);
  await deleteOwnedRows(client, 'projects', ownerId);
  await deleteOwnedRows(client, 'clients', ownerId);

  await insertRows(client, 'clients', store.clients.map(fromClient));
  await insertRows(client, 'projects', store.projects.map(fromProject));
  await insertRows(client, 'tasks', store.tasks.map(fromTask));
  await insertRows(client, 'invoices', store.invoices.map(fromInvoice));
}
