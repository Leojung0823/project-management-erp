# Project ERP 開發狀態 v3

本次已推進：

- 已新增 `docs/full-suite-v2.css`
- 已新增 `docs/full-suite-v2-app.js`
- 保留現有 `docs/full-suite.html` 作為線上入口
- 全模組資料庫 schema 已在 `supabase/full-suite-schema.sql`

目前 GitHub Pages 入口仍可使用既有 full-suite.html。新 v3 外掛 CSS / JS 已放入 repo，下一步是把入口頁切到外掛版。

注意：大型 HTML 入口檔含 script tag 時，GitHub 寫入工具被安全檢查阻擋；已改成拆檔策略繼續推進。
