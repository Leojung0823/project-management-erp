# Production Checklist｜正式上線檢查清單

## 1. GitHub Pages

- Pages Source 使用 `Deploy from a branch`。
- Branch 選 `main`。
- Folder 選 `/docs`。
- Trello 模式入口：

```text
https://leojung0823.github.io/project-management-erp/trello-live.html
```

- 若畫面沒有更新，使用 cache busting：

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=999999
```

## 2. Supabase SQL 執行順序

建議依照下列順序執行：

1. `supabase/schema.sql`
2. `supabase/full-suite-schema.sql`
3. `supabase/full-suite-enterprise-schema.sql`
4. `supabase/full-suite-reporting-views.sql`
5. `supabase/full-suite-v3-hotfix.sql`
6. `supabase/trello-storage.sql`

其中 `full-suite-schema.sql` 與 `trello-storage.sql` 已調整為可重複執行。

## 3. Supabase Authentication

- Authentication → Providers → Anonymous Sign-Ins 必須開啟。
- 目前 MVP 使用匿名登入。
- 正式多人版本需改為 Email / Google 登入與 workspace 權限隔離。

## 4. Supabase Storage

- Storage bucket 名稱：`trello-attachments`
- 先執行：

```text
supabase/trello-storage.sql
```

- 測試流程：
  - 打開 Trello 卡片詳情。
  - 上傳附件。
  - 重新整理頁面。
  - 確認附件仍存在。
  - 到 Supabase Storage 檢查 bucket 中是否有檔案。

## 5. 不可破壞的正式入口

請勿刪除或改名：

```text
docs/trello-live.html
docs/trello-main.js
docs/trello-extra.js
docs/trello-power.js
docs/supabase-default.js
```

## 6. 靜態檢查

執行：

```bash
npm run test:static
node --check docs/trello-main.js
node --check docs/trello-extra.js
node --check docs/trello-power.js
node --check docs/trello-phase2.js
```

## 7. 手動 QA

- 打開 Trello 入口。
- 確認 Supabase 已連線。
- 新增看板。
- 新增列表。
- 新增卡片。
- 拖曳卡片到不同列表。
- 調整卡片順序。
- 打開卡片詳情。
- 新增標籤、成員、檢查清單、留言。
- 上傳附件。
- 匯出 JSON / CSV。
- 同步 ERP 任務。

## 8. 目前限制

- 目前權限主要仍在前端控制，正式版需升級 RLS。
- 目前通知主要是前端提醒，正式背景通知需 Supabase Edge Function / Cron。
- 匿名登入資料會跟瀏覽器 session 綁定。
