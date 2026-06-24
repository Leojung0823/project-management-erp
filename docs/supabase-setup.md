# Supabase 設定教學

這份專案目前支援兩種模式：

1. 本機模式：資料存在瀏覽器 localStorage。
2. Supabase 雲端模式：資料同步到 Supabase PostgreSQL，並用 RLS 隔離使用者資料。

## 1. 建立 Supabase 專案

到 Supabase 建立新 project。

進入：

`Project Settings` → `API`

複製：

- Project URL
- anon / publishable key

## 2. 啟用匿名登入

進入：

`Authentication` → `Sign In / Providers`

啟用：

`Anonymous Sign-Ins`

目前 MVP 使用匿名登入建立工作區。這樣不用先做帳號密碼，也能用 RLS 保護每個使用者只能看到自己的資料。

注意：匿名帳號存在瀏覽器 session 裡。清除瀏覽器資料或換裝置時，會變成新的匿名使用者。正式多人版應改成 Email / Google 登入。

## 3. 建立資料表與 RLS

到 Supabase：

`SQL Editor`

貼上並執行：

`supabase/schema.sql`

這份 SQL 會建立：

- clients
- projects
- tasks
- invoices

並開啟 Row Level Security：

- 每筆資料有 `owner_id`
- 使用者只能 select / insert / update / delete 自己的資料

## 4. 線上 GitHub Pages 版本連線

打開：

`https://leojung0823.github.io/project-management-erp/`

在頁面上填：

- Supabase Project URL
- anon / publishable key

按：

`連線並同步`

如果 Supabase 雲端是空的，系統會把目前瀏覽器資料同步上去。
如果 Supabase 已經有資料，系統會讀取雲端資料並覆蓋目前畫面。

## 5. React / Vite 開發版連線

複製 `.env.example` 成 `.env.local`：

```bash
cp .env.example .env.local
```

填入：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

然後執行：

```bash
npm install
npm run dev
```

## 6. 常見錯誤

### 畫面顯示「匿名登入失敗」

代表 Supabase 沒有啟用 Anonymous Sign-Ins。

### 畫面顯示「讀取資料失敗」

通常是還沒有執行 `supabase/schema.sql`，或資料表名稱不一致。

### 換電腦看不到資料

目前 MVP 是匿名使用者模式。匿名帳號綁在目前瀏覽器 session。正式多人使用要改成 Email / Google 登入。

## 7. 下一階段建議

正式 ERP 建議下一階段改成：

- Email / Google 登入
- 公司 organization / workspace
- 使用者角色：老闆、管理員、專案經理、設計、財務、客戶檢視
- 更細的 RLS policy
- 報價、合約、請款、附件、通知
