import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { fetchCloudStore, hasSupabaseEnv, isEmptyStore, replaceCloudStore, type SyncMode } from './lib/erpRepository';
import { seedData } from './seed';
import type { AppStore, Client, Invoice, InvoiceStatus, Priority, Project, ProjectStatus, Task, TaskStatus } from './types';

const STORAGE_KEY = 'project-management-erp-v1';
const tabs = ['dashboard', 'projects', 'tasks', 'clients', 'finance'] as const;
type Tab = (typeof tabs)[number];

const statusLabels: Record<ProjectStatus | TaskStatus | InvoiceStatus, string> = {
  planning: '規劃中',
  active: '進行中',
  risk: '風險中',
  paused: '暫停',
  done: '完成',
  todo: '待辦',
  doing: '執行中',
  review: '待審核',
  draft: '草稿',
  sent: '已送出',
  paid: '已付款',
  overdue: '逾期'
};

const priorityLabels: Record<Priority, string> = {
  low: '低',
  normal: '一般',
  high: '高',
  urgent: '急件'
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(value);
}

function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedData;
  } catch {
    return seedData;
  }
}

function saveStore(store: AppStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function isOverdue(date: string) {
  return new Date(date).getTime() < new Date().setHours(0, 0, 0, 0);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [store, setStore] = useState<AppStore>(() => loadStore());
  const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'all'>('all');
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'all'>('all');
  const [syncMode, setSyncMode] = useState<SyncMode>('local');
  const [syncMessage, setSyncMessage] = useState(hasSupabaseEnv ? '正在連線 Supabase...' : '本機模式：尚未設定 Supabase');

  useEffect(() => {
    if (!hasSupabaseEnv) return;

    let alive = true;

    async function bootCloud() {
      try {
        setSyncMessage('正在登入 Supabase 並讀取雲端資料...');
        const localStore = loadStore();
        const cloudStore = await fetchCloudStore();
        const nextStore = isEmptyStore(cloudStore) ? localStore : cloudStore;

        if (isEmptyStore(cloudStore)) {
          await replaceCloudStore(localStore);
        }

        if (!alive) return;
        setStore(nextStore);
        saveStore(nextStore);
        setSyncMode('cloud');
        setSyncMessage(isEmptyStore(cloudStore) ? 'Supabase 已連線，已把本機資料同步到雲端' : 'Supabase 已連線，正在使用雲端資料');
      } catch (error) {
        if (!alive) return;
        setSyncMode('local');
        setSyncMessage(`Supabase 連線失敗，暫時使用本機模式：${errorMessage(error)}`);
      }
    }

    void bootCloud();

    return () => {
      alive = false;
    };
  }, []);

  const commit = (next: AppStore) => {
    setStore(next);
    saveStore(next);

    if (syncMode !== 'cloud') return;

    setSyncMessage('正在同步到 Supabase...');
    replaceCloudStore(next)
      .then(() => setSyncMessage(`Supabase 已同步：${new Intl.DateTimeFormat('zh-TW', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date())}`))
      .catch((error) => setSyncMessage(`Supabase 同步失敗，本機仍已保存：${errorMessage(error)}`));
  };

  const clientName = (clientId: string) => store.clients.find((client) => client.id === clientId)?.name ?? '未指定客戶';
  const projectName = (projectId: string) => store.projects.find((project) => project.id === projectId)?.name ?? '未指定專案';

  const metrics = useMemo(() => {
    const activeProjects = store.projects.filter((project) => ['planning', 'active', 'risk'].includes(project.status));
    const overdueTasks = store.tasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate));
    const revenue = store.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const unpaid = store.invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
    const grossMargin = store.projects.reduce((sum, project) => sum + (project.budget - project.cost), 0);
    return { activeProjects, overdueTasks, revenue, unpaid, grossMargin };
  }, [store]);

  const filteredProjects = store.projects.filter((project) => projectFilter === 'all' || project.status === projectFilter);
  const filteredTasks = store.tasks.filter((task) => taskFilter === 'all' || task.status === taskFilter);

  const addProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const project: Project = {
      id: createId('project'),
      code: `PM-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(store.projects.length + 1).padStart(3, '0')}`,
      name: String(form.get('name') || '未命名專案'),
      clientId: String(form.get('clientId') || store.clients[0]?.id || ''),
      manager: String(form.get('manager') || '未指派'),
      budget: Number(form.get('budget') || 0),
      cost: 0,
      status: 'planning',
      priority: String(form.get('priority') || 'normal') as Priority,
      progress: 0,
      deadline: String(form.get('deadline') || new Date().toISOString().slice(0, 10)),
      notes: String(form.get('notes') || '')
    };
    commit({ ...store, projects: [project, ...store.projects] });
    event.currentTarget.reset();
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task: Task = {
      id: createId('task'),
      projectId: String(form.get('projectId') || store.projects[0]?.id || ''),
      title: String(form.get('title') || '未命名任務'),
      owner: String(form.get('owner') || '未指派'),
      status: 'todo',
      priority: String(form.get('priority') || 'normal') as Priority,
      dueDate: String(form.get('dueDate') || new Date().toISOString().slice(0, 10)),
      estimateHours: Number(form.get('estimateHours') || 1)
    };
    commit({ ...store, tasks: [task, ...store.tasks] });
    event.currentTarget.reset();
  };

  const addClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const client: Client = {
      id: createId('client'),
      name: String(form.get('name') || '未命名客戶'),
      contact: String(form.get('contact') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('email') || ''),
      industry: String(form.get('industry') || '')
    };
    commit({ ...store, clients: [client, ...store.clients] });
    event.currentTarget.reset();
  };

  const addInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const invoice: Invoice = {
      id: createId('invoice'),
      projectId: String(form.get('projectId') || store.projects[0]?.id || ''),
      title: String(form.get('title') || '未命名帳款'),
      amount: Number(form.get('amount') || 0),
      status: String(form.get('status') || 'draft') as InvoiceStatus,
      dueDate: String(form.get('dueDate') || new Date().toISOString().slice(0, 10))
    };
    commit({ ...store, invoices: [invoice, ...store.invoices] });
    event.currentTarget.reset();
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    commit({ ...store, projects: store.projects.map((project) => (project.id === projectId ? { ...project, status } : project)) });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    commit({ ...store, tasks: store.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)) });
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    commit({ ...store, invoices: store.invoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice)) });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">ERP</div>
          <div>
            <strong>Project ERP</strong>
            <span>專案管理系統</span>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab === 'dashboard' && '儀表板'}
              {tab === 'projects' && '專案'}
              {tab === 'tasks' && '任務'}
              {tab === 'clients' && '客戶'}
              {tab === 'finance' && '財務'}
            </button>
          ))}
        </nav>
        <section className={`sync-card ${syncMode === 'cloud' ? 'cloud' : ''}`}>
          <strong>{syncMode === 'cloud' ? '雲端同步模式' : '本機模式'}</strong>
          <span>{syncMessage}</span>
        </section>
        <button className="ghost" onClick={() => commit(seedData)}>重置示範資料</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Buzz Design Studio / Internal ERP MVP</p>
            <h1>{activeTab === 'dashboard' ? '老闆總覽' : activeTab === 'projects' ? '專案中心' : activeTab === 'tasks' ? '任務控管' : activeTab === 'clients' ? '客戶資料庫' : '財務與帳款'}</h1>
          </div>
          <div className="today">{new Intl.DateTimeFormat('zh-TW', { dateStyle: 'full' }).format(new Date())}</div>
        </header>

        {activeTab === 'dashboard' && (
          <section className="grid gap">
            <Metric title="進行中專案" value={metrics.activeProjects.length.toString()} hint="含規劃、執行、風險" />
            <Metric title="逾期任務" value={metrics.overdueTasks.length.toString()} hint="未完成且已過期" danger={metrics.overdueTasks.length > 0} />
            <Metric title="總帳款" value={formatMoney(metrics.revenue)} hint="全部發票金額" />
            <Metric title="未收款" value={formatMoney(metrics.unpaid)} hint="草稿、送出、逾期" danger={metrics.unpaid > 0} />
            <Metric title="預估毛利" value={formatMoney(metrics.grossMargin)} hint="專案預算 - 成本" />

            <section className="panel wide">
              <div className="panel-title"><h2>風險與急件</h2><span>優先處理這幾件</span></div>
              <div className="list">
                {store.projects.filter((project) => project.status === 'risk' || project.priority === 'urgent').map((project) => (
                  <div className="list-row" key={project.id}>
                    <div><strong>{project.name}</strong><small>{clientName(project.clientId)} · 截止 {project.deadline}</small></div>
                    <Badge tone={project.status === 'risk' ? 'danger' : 'warning'}>{statusLabels[project.status]}</Badge>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel wide">
              <div className="panel-title"><h2>本週任務</h2><span>依到期日排序</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>任務</th><th>專案</th><th>負責人</th><th>狀態</th><th>到期日</th></tr></thead>
                  <tbody>
                    {[...store.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6).map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{projectName(task.projectId)}</td>
                        <td>{task.owner}</td>
                        <td><Badge tone={task.status === 'done' ? 'success' : 'info'}>{statusLabels[task.status]}</Badge></td>
                        <td className={task.status !== 'done' && isOverdue(task.dueDate) ? 'danger-text' : ''}>{task.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="split">
            <section className="panel">
              <div className="panel-title"><h2>新增專案</h2><span>快速建立專案主檔</span></div>
              <form onSubmit={addProject} className="form">
                <input name="name" placeholder="專案名稱" required />
                <select name="clientId" required>{store.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
                <input name="manager" placeholder="負責人" />
                <input name="budget" type="number" min="0" placeholder="預算金額" />
                <select name="priority"><option value="normal">一般</option><option value="high">高</option><option value="urgent">急件</option><option value="low">低</option></select>
                <input name="deadline" type="date" required />
                <textarea name="notes" placeholder="備註、需求、風險" />
                <button type="submit">新增專案</button>
              </form>
            </section>

            <section className="panel wide">
              <div className="panel-title with-actions">
                <div><h2>專案列表</h2><span>追蹤進度、成本、狀態</span></div>
                <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value as ProjectStatus | 'all')}>
                  <option value="all">全部狀態</option><option value="planning">規劃中</option><option value="active">進行中</option><option value="risk">風險中</option><option value="paused">暫停</option><option value="done">完成</option>
                </select>
              </div>
              <div className="cards">
                {filteredProjects.map((project) => (
                  <article className="project-card" key={project.id}>
                    <div className="card-head">
                      <div><small>{project.code}</small><h3>{project.name}</h3></div>
                      <Badge tone={project.status === 'risk' ? 'danger' : project.status === 'done' ? 'success' : 'info'}>{statusLabels[project.status]}</Badge>
                    </div>
                    <p>{clientName(project.clientId)}</p>
                    <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
                    <div className="meta"><span>進度 {project.progress}%</span><span>截止 {project.deadline}</span><span>預算 {formatMoney(project.budget)}</span><span>成本 {formatMoney(project.cost)}</span></div>
                    <p className="notes">{project.notes}</p>
                    <select value={project.status} onChange={(event) => updateProjectStatus(project.id, event.target.value as ProjectStatus)}>
                      <option value="planning">規劃中</option><option value="active">進行中</option><option value="risk">風險中</option><option value="paused">暫停</option><option value="done">完成</option>
                    </select>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}

        {activeTab === 'tasks' && (
          <section className="split">
            <section className="panel">
              <div className="panel-title"><h2>新增任務</h2><span>派工與追蹤</span></div>
              <form onSubmit={addTask} className="form">
                <input name="title" placeholder="任務名稱" required />
                <select name="projectId" required>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
                <input name="owner" placeholder="負責人" />
                <select name="priority"><option value="normal">一般</option><option value="high">高</option><option value="urgent">急件</option><option value="low">低</option></select>
                <input name="dueDate" type="date" required />
                <input name="estimateHours" type="number" min="1" placeholder="預估工時" />
                <button type="submit">新增任務</button>
              </form>
            </section>
            <section className="panel wide">
              <div className="panel-title with-actions">
                <div><h2>任務看板</h2><span>老闆看狀態、負責人、到期日</span></div>
                <select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value as TaskStatus | 'all')}>
                  <option value="all">全部任務</option><option value="todo">待辦</option><option value="doing">執行中</option><option value="review">待審核</option><option value="done">完成</option>
                </select>
              </div>
              <div className="kanban">
                {(['todo', 'doing', 'review', 'done'] as TaskStatus[]).map((status) => (
                  <div className="lane" key={status}>
                    <h3>{statusLabels[status]}</h3>
                    {filteredTasks.filter((task) => task.status === status).map((task) => (
                      <article className="task-card" key={task.id}>
                        <strong>{task.title}</strong>
                        <small>{projectName(task.projectId)}</small>
                        <div className="meta"><span>{task.owner}</span><span>{priorityLabels[task.priority]}</span><span className={task.status !== 'done' && isOverdue(task.dueDate) ? 'danger-text' : ''}>{task.dueDate}</span></div>
                        <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}>
                          <option value="todo">待辦</option><option value="doing">執行中</option><option value="review">待審核</option><option value="done">完成</option>
                        </select>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}

        {activeTab === 'clients' && (
          <section className="split">
            <section className="panel">
              <div className="panel-title"><h2>新增客戶</h2><span>CRM 基礎資料</span></div>
              <form onSubmit={addClient} className="form">
                <input name="name" placeholder="公司名稱" required />
                <input name="contact" placeholder="窗口" />
                <input name="phone" placeholder="電話" />
                <input name="email" type="email" placeholder="Email" />
                <input name="industry" placeholder="產業" />
                <button type="submit">新增客戶</button>
              </form>
            </section>
            <section className="panel wide">
              <div className="panel-title"><h2>客戶列表</h2><span>串接專案與帳款</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>公司</th><th>窗口</th><th>產業</th><th>電話</th><th>Email</th><th>專案數</th></tr></thead>
                  <tbody>{store.clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.name}</td><td>{client.contact}</td><td>{client.industry}</td><td>{client.phone}</td><td>{client.email}</td><td>{store.projects.filter((project) => project.clientId === client.id).length}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === 'finance' && (
          <section className="split">
            <section className="panel">
              <div className="panel-title"><h2>新增帳款</h2><span>請款與收款追蹤</span></div>
              <form onSubmit={addInvoice} className="form">
                <input name="title" placeholder="帳款名稱" required />
                <select name="projectId" required>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
                <input name="amount" type="number" min="0" placeholder="金額" required />
                <select name="status"><option value="draft">草稿</option><option value="sent">已送出</option><option value="paid">已付款</option><option value="overdue">逾期</option></select>
                <input name="dueDate" type="date" required />
                <button type="submit">新增帳款</button>
              </form>
            </section>
            <section className="panel wide">
              <div className="panel-title"><h2>帳款列表</h2><span>未收款、逾期、現金流</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>帳款</th><th>專案</th><th>金額</th><th>狀態</th><th>到期日</th><th>更新</th></tr></thead>
                  <tbody>{store.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.title}</td><td>{projectName(invoice.projectId)}</td><td>{formatMoney(invoice.amount)}</td><td><Badge tone={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>{statusLabels[invoice.status]}</Badge></td><td className={invoice.status !== 'paid' && isOverdue(invoice.dueDate) ? 'danger-text' : ''}>{invoice.dueDate}</td>
                      <td><select value={invoice.status} onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as InvoiceStatus)}><option value="draft">草稿</option><option value="sent">已送出</option><option value="paid">已付款</option><option value="overdue">逾期</option></select></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ title, value, hint, danger = false }: { title: string; value: string; hint: string; danger?: boolean }) {
  return (
    <section className={`metric ${danger ? 'danger' : ''}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </section>
  );
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
