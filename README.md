# Project Management ERP｜專案管理 ERP 系統

這是一套可以直接使用的專案管理 ERP MVP。第一版已支援兩種模式：

1. 本機模式：資料存在使用者自己的瀏覽器 `localStorage`。
2. Supabase 雲端模式：資料同步到 Supabase PostgreSQL，並用 RLS 依使用者隔離資料。

## 目前可用功能

- 老闆儀表板：進行中專案、逾期任務、未收款、總帳款、預估毛利
- 專案中心：新增專案、查看客戶、負責人、預算、成本、進度、狀態、風險備註
- 任務控管：新增任務、看板分類、調整任務狀態、查看負責人與到期日
- 客戶資料庫：新增客戶、記錄窗口、電話、Email、產業別
- 財務帳款：新增請款、調整草稿/已送出/已付款/逾期狀態
- 本機資料持久化：未設定 Supabase 時使用 `localStorage`
- Supabase 雲端同步：有 Supabase 設定時自動登入匿名工作區並同步資料
- GitHub Pages：目前可用 `main / docs` 發布靜態版本

## 線上使用

目前 GitHub Pages 建議設定：

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

即可連線並同步。

## Supabase 設定

完整設定請看：

```text
docs/supabase-setup.md
```

必要步驟：

1. 建立 Supabase project
2. 到 `Authentication` 啟用 `Anonymous Sign-Ins`
3. 到 `SQL Editor` 執行 `supabase/schema.sql`
4. 在線上頁面填 Project URL 與 anon / publishable key

目前 MVP 使用匿名登入。Supabase 官方文件說明，`signInAnonymously()` 會建立匿名使用者，匿名使用者會使用 authenticated role，因此可以搭配 RLS 做資料隔離。正式多人版建議升級成 Email / Google 登入。

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

如果沒有填環境變數，React 版會保留本機模式，不會壞掉。

## 建置正式版本

```bash
npm run build
npm run preview
```

## 資料注意事項

目前雲端模式使用匿名登入，所以資料會跟目前瀏覽器 session 綁定。清除瀏覽器資料或換裝置時，會變成另一個匿名使用者。

正式多人 ERP 下一步要改成：

- Email / Google 登入
- 公司 workspace / organization
- 使用者角色：老闆、管理員、專案經理、財務、員工、客戶檢視
- 更細的 RLS policy
- 檔案上傳、留言、通知、審核流

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
