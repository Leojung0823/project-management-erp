# Project Management ERP｜專案管理 ERP 系統

這是一套專案管理 ERP MVP。最新版已改為 **Supabase-only 雲端模式**：

- ERP 業務資料不再保存到瀏覽器本機 `localStorage`。
- 未連線 Supabase 時，系統會封鎖新增、匯入、匯出與重置操作。
- `localStorage` 只暫存 Supabase URL/key 設定與 Supabase Auth session，不保存專案、任務、客戶、帳款資料。

## 目前可用功能

- 老闆儀表板：專案數、進行中任務、已收款、待收款
- 專案中心：新增專案、查看客戶、負責人、預算、進度、狀態、風險備註
- 任務控管：新增任務、調整任務狀態、查看負責人與到期日
- 客戶資料庫：新增客戶、記錄窗口、電話、Email、產業別
- 財務帳款：新增請款、調整草稿/已送出/已收款/逾期狀態
- Supabase 雲端同步：使用 Supabase Auth 匿名登入與 RLS 做資料隔離
- GitHub Pages：目前使用 `main / docs` 發布靜態版本

## 線上使用

GitHub Pages 設定：

```text
Settings → Pages → Deploy from a branch → main / docs
```

網址：

```text
https://leojung0823.github.io/project-management-erp/
```

線上頁面會出現 Supabase 連線區，填入：

- Supabase Project URL
- anon / publishable key

即可連線。不要填 `service_role` 或 `secret key`。

## Supabase 設定

完整設定請看：

```text
docs/supabase-setup.md
```

必要步驟：

1. 建立 Supabase project
2. 到 `SQL Editor` 執行 `supabase/schema.sql`
3. 到 `Authentication` 啟用 `Anonymous Sign-Ins`
4. 在線上頁面填 Project URL 與 anon / publishable key

目前 MVP 使用匿名登入。正式多人 ERP 下一步要改成 Email / Google 登入、公司 workspace 與角色權限。

## 本機執行

```bash
npm install
npm run dev
```

打開：

```bash
http://localhost:5173
```

## 本機 React 版接 Supabase

複製 `.env.example` 成 `.env.local`：

```bash
cp .env.example .env.local
```

填入：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

後續正式開發應移除 React 版內殘留的 local fallback，與目前 GitHub Pages 的 Supabase-only 行為一致。

## 建置正式版本

```bash
npm run build
npm run preview
```

## PM ERP 完整升級方案

完整 PM 專家檢討與產品升級方案請看：

```text
docs/pm-erp-upgrade-plan.md
```

## 資料注意事項

目前雲端模式使用匿名登入，所以資料會跟目前瀏覽器 session 綁定。清除瀏覽器資料或換裝置時，會變成另一個匿名使用者。

正式多人 ERP 下一步要改成：

- Email / Google 登入
- 公司 workspace / organization
- 使用者角色：老闆、管理員、專案經理、財務、員工、客戶檢視
- 更細的 RLS policy
- 檔案上傳、留言、通知、審核流
