# Project Management ERP｜專案管理 ERP 系統

這是一套可以直接使用的專案管理 ERP MVP。第一版先用 React + Vite + localStorage，資料會存在使用者自己的瀏覽器，不需要後端就能先開始管理案子。

## 目前可用功能

- 老闆儀表板：進行中專案、逾期任務、未收款、總帳款、預估毛利
- 專案中心：新增專案、查看客戶、負責人、預算、成本、進度、狀態、風險備註
- 任務控管：新增任務、看板分類、調整任務狀態、查看負責人與到期日
- 客戶資料庫：新增客戶、記錄窗口、電話、Email、產業別
- 財務帳款：新增請款、調整草稿/已送出/已付款/逾期狀態
- 本機資料持久化：目前用 `localStorage`，重新整理頁面不會消失
- GitHub Pages：已加入部署 workflow，可用 Actions 部署靜態網站

## 本機執行

```bash
npm install
npm run dev
```

打開：

```bash
http://localhost:5173
```

## 建置正式版本

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

此 repo 已加入 `.github/workflows/deploy.yml`。推送到 `main` 後，GitHub Actions 會自動 build 並部署。

若第一次部署沒有網址，請到 GitHub repo：

`Settings` → `Pages` → `Build and deployment` → `Source` 選 `GitHub Actions`

之後網址通常會是：

```text
https://leojung0823.github.io/project-management-erp/
```

## 資料注意事項

目前資料存在瀏覽器 localStorage，適合單人或內部先試用。換電腦、換瀏覽器、清除瀏覽器資料時，資料不會自動同步。

正式多人使用時，下一步要接 Supabase / PostgreSQL，並加上登入、角色權限、RLS、檔案上傳與通知。

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
