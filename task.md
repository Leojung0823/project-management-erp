# tasks.md — Codex Agent Loop 任務清單

## Agent Loop 執行規則

* [ ] 讀取本檔，從第一個未完成的 `- [ ]` 任務開始。
* [ ] 每完成一個任務，先執行測試或靜態檢查，再 Git Commit。
* [ ] Commit 完後，把本檔該任務改成 `- [x]`。
* [ ] 接著自動執行下一個任務，不需要停下來問使用者。
* [ ] 除非遇到以下情況，才允許暫停詢問：會刪除正式資料、需要付費服務、需要 secret key、會破壞 production 網址、會重設 Supabase DB。
* [ ] 不得把 `service_role`、`sb_secret`、私密 token、個人密碼寫進前端或文件。
* [ ] ERP 業務資料不得存 localStorage；localStorage 只允許存 UI 偏好、active board id、publishable key 等非機密設定。
* [ ] 每個任務完成後使用 commit message 格式：`task: <完成項目摘要>`。

---

## Phase 0｜穩定現況，不破壞已可用版本

* [ ] 檢查目前檔案：`docs/trello-live.html`、`docs/trello-main.js`、`docs/trello-extra.js`、`docs/trello-power.js`、`docs/trello.css`、`docs/trello-extra.css`、`docs/trello-power.css`、`docs/supabase-default.js`。
* [ ] 建立 `docs/trello-dev-notes.md`，記錄目前 Trello 模式架構、script 載入順序、Supabase 資料模型、已知限制。
* [ ] 新增 `scripts/check-static-site.mjs`，檢查 HTML 引用的 CSS / JS 檔是否存在。
* [ ] 對所有 Trello JS 檔執行語法檢查，例如 `node --check docs/trello-main.js`。
* [ ] 新增 `npm run test:static`，執行靜態檢查。
* [ ] 建立 `docs/trello-qa-checklist.md`，列出手動測試：連線 Supabase、新增看板、新增列表、新增卡片、拖拉、卡片詳情、附件、匯出、同步 ERP 任務。

---

## Phase 1｜Trello 資料模型穩定化

* [ ] 在 Trello board data 中加入 `schemaVersion`，目前版本定為 `2`。
* [ ] 實作資料 migration：載入舊資料時自動補齊 `members`、`labels`、`templates`、`lists`、`archived`、`activity`。
* [ ] 每張 card 自動補齊：`check`、`comments`、`attachments`、`customFields`、`timeLogs`、`activity`、`priority`、`coverUrl`。
* [ ] 實作 `normalizeBoard()` 與 `normalizeCard()`，所有資料寫入 Supabase 前必須 normalize。
* [ ] 實作 save debounce / save queue，避免快速拖拉或快速編輯時 Supabase 寫入互相覆蓋。
* [ ] 統一活動紀錄格式：`{ id, type, text, by, at, payload }`。
* [ ] 所有卡片新增、更新、拖曳、封存、附件、留言、同步 ERP 都要寫入 board activity 與 card activity。

---

## Phase 2｜Trello 核心互動

* [ ] 實作真正的卡片拖拉排序：同列表內可拖曳到任意位置。
* [ ] 跨列表拖拉時保留目標位置，不只是丟到列表最後。
* [ ] 實作列表拖拉排序。
* [ ] 列表支援新增、改名、封存、刪除。
* [ ] 卡片支援複製、移動到指定列表、封存、還原、永久刪除。
* [ ] 列表底部支援快捷新增卡片：輸入文字後 Enter 直接新增。
* [ ] 卡片詳情 modal 支援 Esc 關閉、點背景關閉，且儲存後不重置捲動位置。

---

## Phase 3｜多看板與工作區

* [ ] 完善多看板切換 UI。
* [ ] 實作新增看板、複製看板、重新命名看板。
* [ ] 實作看板封存，不要直接永久刪除。
* [ ] 新增看板設定面板：名稱、描述、預設成員、預設標籤、權限模式。
* [ ] 建立 workspace data 結構，先存在 board data 中，未來可升級成獨立資料表。
* [ ] 建立 `supabase/trello-workspace-schema.sql` 草案，規劃 `workspaces`、`workspace_members`、`board_members`、`board_permissions`。

---

## Phase 4｜卡片詳情完整化

* [ ] 卡片支援標題、描述、到期日、負責成員、標籤、優先級。
* [ ] 檢查清單支援新增、編輯、刪除、勾選、完成率顯示。
* [ ] 留言支援新增、刪除自己的留言、顯示建立時間。
* [ ] 標籤支援新增、改名、改色、刪除。
* [ ] 成員支援新增、改名、停用。
* [ ] 卡片支援 priority：低 / 中 / 高 / 急件。
* [ ] 卡片支援 custom fields：文字、數字、日期、選項。

---

## Phase 5｜附件與 Supabase Storage

* [ ] 確認 `supabase/trello-storage.sql` 可重複執行且不會報錯。
* [ ] Storage bucket 使用 `trello-attachments`。
* [ ] 實作附件上傳到 Supabase Storage。
* [ ] 顯示附件上傳進度、成功提示、失敗錯誤訊息。
* [ ] 附件資料寫回卡片：檔名、路徑、大小、MIME、URL、上傳者、上傳時間。
* [ ] 卡片詳情顯示附件列表，可開啟、複製連結、刪除。
* [ ] 卡片封面可從附件圖片中選擇，也可手動貼 URL。
* [ ] 卡片列表上顯示封面縮圖與附件數量。

---

## Phase 6｜通知與提醒

* [ ] 實作到期提醒面板：逾期、今天到期、7 天內到期。
* [ ] 實作瀏覽器通知權限流程。
* [ ] 同一卡片同一天只提醒一次，避免狂跳通知。
* [ ] 新增 in-app notifications 區塊。
* [ ] 建立 `docs/notification-plan.md`，規劃 Supabase Edge Function / Cron 的正式背景提醒方案。
* [ ] 若尚未實作真正背景排程，文件必須明確標註「目前僅前端提醒」。

---

## Phase 7｜權限與多人協作

* [ ] 前端先實作角色規則：owner、admin、member、viewer。
* [ ] viewer 只能讀取，不能新增、編輯、刪除、拖拉、上傳附件。
* [ ] member 可操作卡片，但不能改看板權限與成員設定。
* [ ] admin 可管理看板設定、成員、標籤、列表。
* [ ] owner 可管理工作區與最高權限。
* [ ] UI 必須根據角色禁用按鈕。
* [ ] 建立 `docs/trello-rls-plan.md`，規劃正式登入與 workspace isolation 的 RLS 設計。

---

## Phase 8｜Trello 與 ERP 任務同步

* [ ] 實作「同步目前卡片到 ERP 任務」。
* [ ] 實作「同步全部未同步卡片到 ERP 任務」。
* [ ] 同步到 `erp_records`，module 使用 `tasks`。
* [ ] 同步必須 idempotent，同一張卡片重複同步不應產生重複任務。
* [ ] 在卡片 data 中保存 `erpTaskId` 與 `lastSyncedAt`。
* [ ] 欄位 mapping：卡片標題→任務名稱、列表→狀態、到期日→期限、成員→負責人、描述→說明、檢查清單→檢查清單、標籤→標籤。
* [ ] 補同步結果摘要：新增幾筆、更新幾筆、失敗幾筆。
* [ ] 建立 `docs/trello-erp-sync.md`，說明 Trello 與 ERP 資料如何對應。

---

## Phase 9｜視圖：看板 / 表格 / 月曆 / 時間軸 / 儀表板

* [ ] 表格視圖支援排序：列表、到期日、負責人、優先級、完成率。
* [ ] 表格視圖支援欄位顯示切換。
* [ ] 月曆視圖改成真正月曆格。
* [ ] 月曆視圖可切換月份。
* [ ] 新增時間軸視圖。
* [ ] 新增看板儀表板：卡片總數、逾期數、完成率、各成員工作量、各標籤數量。

---

## Phase 10｜匯出 / 匯入 / 備份

* [ ] 匯出 JSON：包含所有看板、卡片、附件 metadata、成員、標籤、活動紀錄。
* [ ] 匯入 JSON：支援 dry-run 預覽，避免覆蓋現有資料。
* [ ] 匯出 CSV：輸出卡片清單，欄位含看板、列表、標題、描述、到期日、成員、標籤、完成率、附件數、工時。
* [ ] 新增「備份目前看板」與「備份全部看板」兩種模式。
* [ ] 匯入失敗時顯示哪一筆資料失敗。

---

## Phase 11｜UI / UX 優化

* [ ] 統一 Trello 模式視覺系統：顏色、按鈕、卡片、modal、表格、側邊抽屜。
* [ ] 手機版可用：橫向看板可滑動，modal 不超出螢幕。
* [ ] 卡片內容過長時不撐爆列表。
* [ ] 所有空狀態都要有清楚文案與下一步行動。
* [ ] 所有失敗狀態都要有可操作的錯誤訊息。
* [ ] 補 loading skeleton 或 loading state，避免畫面看起來卡住。

---

## Phase 12｜Security / Production Readiness

* [ ] 搜尋整個 repo，確認沒有 `service_role`、`sb_secret`、私密 token、個人密碼被寫進前端或文件。
* [ ] 確認 `docs/supabase-default.js` 只包含 publishable / anon 等可公開 client key，不包含 secret。
* [ ] 確認所有 Supabase SQL 都是 idempotent，可重複執行。
* [ ] 確認所有 RLS policy 有文件說明。
* [ ] 對 destructive action 加上 confirm：刪除看板、刪除列表、永久刪除卡片、刪除附件。
* [ ] 補 `docs/production-checklist.md`，列出正式上線前必做事項。

---

## Phase 13｜Final QA

* [ ] 執行 `npm run test:static` 或等效靜態檢查，所有 JS 必須語法通過。
* [ ] 手動測試 `docs/trello-live.html`：新看板、新列表、新卡片、拖拉、詳情、標籤、成員、檢查清單、留言、封存、附件、匯出、同步 ERP 任務。
* [ ] 確認 GitHub Pages 入口仍可用，並記錄測試網址到 README。
* [ ] 更新 README：加入 Trello 模式網址、Supabase SQL 執行順序、Storage 設定、常見錯誤排查。
* [ ] 完成最終 commit：`docs: update Trello mode usage and QA notes`。
