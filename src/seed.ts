import type { AppStore } from './types';

export const seedData: AppStore = {
  clients: [
    {
      id: 'client-001',
      name: '迎暉光電股份有限公司',
      contact: '採購部 王小姐',
      phone: '02-0000-0000',
      email: 'buyer@example.com',
      industry: '光電材料'
    },
    {
      id: 'client-002',
      name: '群英扶輪專案辦公室',
      contact: '秘書處',
      phone: '02-1234-5678',
      email: 'service@example.com',
      industry: '非營利／活動'
    },
    {
      id: 'client-003',
      name: 'Buzz Marketing',
      contact: 'Leo J',
      phone: '0900-000-000',
      email: 'buzzdesign2023@gmail.com',
      industry: '品牌設計／行銷'
    }
  ],
  projects: [
    {
      id: 'project-001',
      code: 'PM-2606-001',
      name: '新辦公室裝修與搬遷',
      clientId: 'client-003',
      manager: 'Leo',
      budget: 850000,
      cost: 420000,
      status: 'active',
      priority: 'high',
      progress: 48,
      deadline: '2026-08-31',
      notes: '天花板、照明、消防、弱電、廁所重新裝修。'
    },
    {
      id: 'project-002',
      code: 'PM-2606-002',
      name: 'ERP 系統 MVP 建置',
      clientId: 'client-003',
      manager: 'AI Team',
      budget: 350000,
      cost: 65000,
      status: 'planning',
      priority: 'urgent',
      progress: 15,
      deadline: '2026-07-31',
      notes: '先建立專案、任務、客戶、發票與報表模組。'
    },
    {
      id: 'project-003',
      code: 'PM-2606-003',
      name: 'Barrier Film 報價管理',
      clientId: 'client-001',
      manager: 'Sales',
      budget: 220000,
      cost: 48000,
      status: 'risk',
      priority: 'normal',
      progress: 62,
      deadline: '2026-07-12',
      notes: '追蹤 SBR10-1、SBR10-2、SBR10-3 報價與 DDP 條件。'
    }
  ],
  tasks: [
    {
      id: 'task-001',
      projectId: 'project-001',
      title: '確認裝修預算與每週進度表',
      owner: 'Leo',
      status: 'doing',
      priority: 'high',
      dueDate: '2026-06-28',
      estimateHours: 6
    },
    {
      id: 'task-002',
      projectId: 'project-002',
      title: '定義 MVP 權限與資料表',
      owner: 'PM',
      status: 'todo',
      priority: 'urgent',
      dueDate: '2026-06-30',
      estimateHours: 10
    },
    {
      id: 'task-003',
      projectId: 'project-003',
      title: '建立報價單版本控管',
      owner: 'Sales',
      status: 'review',
      priority: 'normal',
      dueDate: '2026-06-26',
      estimateHours: 4
    },
    {
      id: 'task-004',
      projectId: 'project-001',
      title: '整理消防與弱電施工項目',
      owner: 'Design',
      status: 'done',
      priority: 'high',
      dueDate: '2026-06-22',
      estimateHours: 8
    }
  ],
  invoices: [
    {
      id: 'invoice-001',
      projectId: 'project-001',
      title: '裝修設計第一期款',
      amount: 180000,
      status: 'sent',
      dueDate: '2026-07-05'
    },
    {
      id: 'invoice-002',
      projectId: 'project-002',
      title: 'ERP MVP 預付款',
      amount: 65000,
      status: 'draft',
      dueDate: '2026-06-30'
    },
    {
      id: 'invoice-003',
      projectId: 'project-003',
      title: 'Barrier Film 樣品費用',
      amount: 32000,
      status: 'paid',
      dueDate: '2026-06-18'
    }
  ]
};
