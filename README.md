# Project Management ERP｜專案管理 ERP 系統

這是一個 GitHub-ready 的專案管理 ERP MVP，適合拿來當新 repo 的起始版本。

## 目前包含

- 儀表板：進行中專案、逾期任務、未收款、毛利估算
- 專案中心：專案主檔、客戶、負責人、預算、成本、進度、風險狀態
- 任務控管：待辦、執行中、待審核、完成的看板
- 客戶資料庫：公司、窗口、電話、Email、產業
- 財務帳款：請款、未收款、逾期、已付款
- 本機資料持久化：先用 `localStorage`，後續可接 Supabase / PostgreSQL

## 建議技術路線

第一版先用 React + Vite 快速做前台與內部流程驗證。等流程確認後，再接 Supabase 或 PostgreSQL，補上登入、權限、檔案上傳、審核流程與正式部署。

## 本機執行

```bash
npm install
npm run dev
```

打開：

```bash
http://localhost:5173
```

## 建議 repo 名稱

```text
project-management-erp
```

## GitHub 上傳方式

```bash
git init
git add .
git commit -m "initial project management erp mvp"
git branch -M main
git remote add origin https://github.com/Leojung0823/project-management-erp.git
git push -u origin main
```

## 後續正式 ERP 模組

1. 帳號與權限
   - superadmin / admin / project_manager / finance / staff / client_viewer
2. 專案管理
   - 專案、里程碑、任務、工時、附件、留言、審核
3. 業務流程
   - 客戶、需求、報價、合約、請款、收款
4. 財務流程
   - 預算、成本、毛利、應收帳款、付款提醒
5. 報表
   - 專案損益、逾期任務、現金流、負責人工作量
6. 通知
   - Email / LINE / Slack / 站內通知
7. 審核流
   - 報價審核、採購審核、請款審核、結案審核

## 建議下一步

- 把 `docs/database-schema.sql` 匯入 Supabase / PostgreSQL
- 建立登入與 RLS 權限規則
- 將目前 localStorage 改成 API + DB
- 增加檔案上傳與專案留言
- 補 GitHub Issues 作為開發 Roadmap
