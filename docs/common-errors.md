# Common Errors｜常見錯誤排查

## GitHub Pages 沒更新

處理方式：

1. 確認 Settings → Pages 是 `main / docs`。
2. 等 1–3 分鐘。
3. 使用版本參數避開快取：

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=999999
```

## Supabase 尚未連線

檢查：

1. `docs/supabase-default.js` 是否存在。
2. Supabase Project URL 是否正確。
3. 使用的是 publishable / anon client key。
4. Authentication → Anonymous Sign-Ins 是否開啟。
5. 是否已執行 `supabase/full-suite-schema.sql`。

## 找不到 erp_records

代表尚未建立 full-suite 資料表。執行：

```text
supabase/full-suite-schema.sql
```

## 找不到 erp_activity 欄位

執行：

```text
supabase/full-suite-v3-hotfix.sql
```

目前新版 `full-suite-schema.sql` 已包含相容欄位，但舊資料庫仍建議跑 hotfix。

## Storage 上傳失敗

檢查：

1. 是否已執行 `supabase/trello-storage.sql`。
2. Storage bucket 是否有 `trello-attachments`。
3. 使用者是否已登入，包括匿名登入。
4. 上傳檔案是否過大。

## 第二次跑 SQL 報 policy 已存在

請拉最新版本的 SQL。新版已將 policy 建立包進 `do $$ ... $$` 檢查，避免重複執行報錯。

## 匯出或同步沒有反應

檢查瀏覽器 console，常見原因：

- Supabase session 過期。
- 被瀏覽器阻擋下載。
- Trello board data 太舊，需重新整理讓 normalizeBoard 自動補齊欄位。

## 卡片資料刷新後不見

這通常是匿名登入 session 改變造成。正式版要改 Email / Google 登入與 workspace 權限隔離。
