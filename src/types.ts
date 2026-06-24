export type ProjectStatus = 'planning' | 'active' | 'risk' | 'paused' | 'done';
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  industry: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  clientId: string;
  manager: string;
  budget: number;
  cost: number;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  deadline: string;
  notes: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  estimateHours: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface AppStore {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
}
