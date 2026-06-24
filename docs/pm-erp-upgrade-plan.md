# Project ERP 完整升級方案

> 角色視角：PM / ERP 產品負責人
> 目標：把目前 MVP 從「個人可用的專案資料庫」升級為「設計公司 / 材料貿易 / 裝修工程都能用的專案管理 ERP」。

## 1. 目前版本定位

目前系統已具備 MVP 雛形：

- 專案管理：專案名稱、客戶、負責人、預算、狀態、期限。
- 任務管理：任務、專案歸屬、負責人、狀態、優先級、到期日。
- 客戶管理：公司、窗口、電話、Email、產業。
- 帳款管理：帳款名稱、專案、金額、狀態、到期日。
- 儀表板：專案數、進行中任務、已收款、待收款。
- Supabase：已開始接雲端資料庫與 RLS。

這是好的第一步，但還不是正式 ERP。正式 ERP 的核心不是「能新增資料」，而是要能支撐完整營運流程、權限、責任、審核、報表、追蹤與風險控管。

## 2. 重大缺口總覽

### 2.1 帳號與權限缺口

目前缺：

- 正式登入：Email / Google 登入。
- 組織 / 公司 workspace。
- 使用者角色：老闆、PM、設計、業務、財務、行政、外部客戶。
- 權限矩陣：誰能看財務、誰能改成本、誰能刪專案。
- 邀請成員、停用成員、離職帳號移交。
- 操作紀錄 audit log。

建議：

- Anonymous Sign-In 只作為過渡方案。
- 正式版改成 Supabase Auth + profiles + organizations + organization_members。
- RLS 改成 organization_id 隔離資料，不再只用 owner_id。

### 2.2 專案管理缺口

目前專案只有簡單主檔，缺少 PM 必要結構：

- 專案階段：洽談、報價、簽約、啟動、設計、製作、交付、驗收、結案。
- WBS 工作分解。
- 里程碑 milestone。
- 交付物 deliverables。
- 任務依賴 dependency。
- 甘特圖 / 時程表。
- 變更單 change request。
- 風險登錄 risk register。
- 問題追蹤 issue log。
- 驗收紀錄 acceptance。
- 專案結案報告。

建議：

- 新增 project_phases、milestones、deliverables、risks、issues、change_requests。
- 專案列表增加健康燈號：正常 / 注意 / 風險 / 延誤 / 超支。

### 2.3 任務與協作缺口

目前任務只支援新增與改狀態，缺少協作機制：

- 任務留言。
- 任務附件。
- checklist。
- 子任務。
- 任務指派通知。
- 任務審核流程。
- 重複任務。
- 工時紀錄。
- 到期提醒。
- 任務修改紀錄。

建議：

- 任務拆成：tasks、task_comments、task_checklists、task_attachments、time_entries。
- 任務狀態改成可自訂 workflow。

### 2.4 客戶 CRM 缺口

目前只有客戶名錄，還不是 CRM。

缺少：

- 客戶聯絡人多筆。
- 商機 opportunity。
- 銷售階段：初談、需求確認、報價、議價、成交、失單。
- 跟進紀錄。
- 報價單。
- 合約。
- 客戶歷史專案。
- 客戶分級。
- 客戶來源。
- 下次跟進提醒。

建議：

- 新增 contacts、opportunities、activities、quotes、contracts。
- 支援「商機轉專案」。

### 2.5 財務與帳款缺口

目前財務只是 invoices，離 ERP 還有距離。

缺少：

- 報價單 quote。
- 發票 / 請款單 invoice 明細項目。
- 收款紀錄 payments。
- 應收帳款 AR。
- 應付帳款 AP。
- 成本支出 expenses。
- 採購單 purchase orders。
- 毛利分析。
- 現金流預估。
- 稅額、未稅、含稅。
- 幣別。
- 分期收款。
- 逾期催收。

建議：

- quotes → approved quote → project → invoice → payment。
- project_costs / expenses 用來算專案毛利。
- 財務權限獨立，不讓一般成員看到毛利與成本。

### 2.6 文件與檔案缺口

正式 PM ERP 一定需要文件管理。

缺少：

- 合約檔。
- 報價單 PDF。
- 客戶需求文件。
- 設計稿連結。
- 會議記錄。
- 驗收單。
- 檔案版本。
- 權限控管。

建議：

- 使用 Supabase Storage。
- 新增 documents 表：entity_type、entity_id、file_path、version、uploaded_by。

### 2.7 通知與提醒缺口

目前沒有通知系統。

缺少：

- 任務到期提醒。
- 逾期通知。
- 新任務指派通知。
- 帳款到期提醒。
- 專案風險提醒。
- LINE / Email 通知。
- 每日 / 每週摘要。

建議：

- 先做站內通知。
- 第二階段接 Email。
- 第三階段接 LINE Notify / LINE Messaging API。

### 2.8 報表與管理決策缺口

老闆真正需要的是決策，不只是資料輸入。

缺少：

- 本月營收。
- 本月待收款。
- 本月新增商機。
- 專案毛利排行。
- 人員工作量。
- 逾期任務清單。
- 逾期帳款清單。
- 專案風險排行榜。
- 業務漏斗。
- 客戶貢獻分析。
- 年度 / 月度趨勢。

建議：

- 儀表板分成：老闆總覽、PM 總覽、財務總覽、業務總覽。

## 3. 建議資料庫架構

### 3.1 核心多租戶權限

- organizations
- profiles
- organization_members
- roles
- permissions
- audit_logs

### 3.2 CRM / 業務

- clients
- contacts
- opportunities
- activities
- quotes
- quote_items
- contracts

### 3.3 專案管理

- projects
- project_members
- project_phases
- milestones
- deliverables
- tasks
- task_comments
- task_checklists
- task_dependencies
- risks
- issues
- change_requests
- time_entries

### 3.4 財務

- invoices
- invoice_items
- payments
- expenses
- purchase_orders
- project_costs

### 3.5 文件

- documents
- document_versions
- storage_buckets

### 3.6 通知

- notifications
- notification_settings
- scheduled_jobs

## 4. 正式產品模組設計

### 4.1 老闆總覽

老闆頁面不應該塞很多表格，要回答五個問題：

1. 哪些案子有風險？
2. 哪些錢快收不到？
3. 哪些人工作量過高？
4. 哪些案子毛利不好？
5. 下週最重要的決策是什麼？

必要元件：

- 營收 / 待收 / 毛利 KPI。
- 紅燈專案。
- 逾期任務。
- 逾期帳款。
- 本週決策清單。

### 4.2 專案中心

必要功能：

- 專案主檔。
- 專案階段。
- 專案成員。
- 甘特圖。
- 里程碑。
- 任務列表。
- 風險與問題。
- 變更單。
- 文件。
- 帳款與成本。
- 結案。

### 4.3 任務中心

必要功能：

- Kanban。
- 我的任務。
- 本週任務。
- 逾期任務。
- 任務留言。
- 子任務。
- 附件。
- 工時。
- 審核。

### 4.4 CRM 業務中心

必要功能：

- 客戶資料。
- 聯絡人。
- 商機。
- 報價。
- 合約。
- 跟進紀錄。
- 商機轉專案。

### 4.5 財務中心

必要功能：

- 報價單。
- 請款單。
- 收款。
- 支出。
- 毛利。
- 現金流。
- 逾期催收。

## 5. 開發路線圖

### Phase 0：穩定 Supabase-only MVP（現在）

目標：先讓資料不再散落在瀏覽器本機。

- 關閉本機資料模式。
- Supabase URL / key 連線。
- RLS 正常。
- CRUD 寫入 Supabase。
- 清除舊 GitHub Actions Pages workflow。
- main / docs 穩定發布。

### Phase 1：正式帳號與團隊權限

目標：讓公司內部多人可用。

- Email / Google 登入。
- profiles。
- organizations。
- organization_members。
- role-based RLS。
- 邀請成員。
- 權限矩陣。
- 操作紀錄。

### Phase 2：專案管理核心

目標：讓 PM 真正能管案。

- 專案階段。
- 里程碑。
- 任務子項。
- 任務留言。
- 工時。
- 風險 / 問題。
- 專案文件。
- 任務提醒。

### Phase 3：CRM + 報價 + 合約

目標：把業務流程接進專案。

- 客戶多聯絡人。
- 商機漏斗。
- 報價單。
- 合約。
- 報價轉專案。
- 客戶跟進紀錄。

### Phase 4：財務 ERP

目標：讓老闆能看錢。

- 請款單明細。
- 收款紀錄。
- 支出成本。
- 專案毛利。
- 現金流預測。
- 逾期收款提醒。

### Phase 5：自動化與 AI

目標：降低管理成本。

- 每日摘要。
- 逾期提醒。
- LINE / Email 通知。
- 會議紀錄轉任務。
- 專案風險 AI 判讀。
- 自動產生週報。

## 6. 優先順序建議

最優先不是漂亮 UI，而是：

1. 正式登入與組織權限。
2. 專案、任務、客戶、帳款的完整 CRUD。
3. 財務權限隔離。
4. 任務留言與附件。
5. 專案風險與帳款逾期提醒。

## 7. 風險提醒

- 不要把 service_role / secret key 放在前端。
- 不要長期使用 anonymous user 作為正式帳號。
- 不要讓所有人都能看成本與毛利。
- 不要只做任務看板，卻沒有收款與成本追蹤。
- 不要讓資料表只有 owner_id，正式多人公司要改 organization_id。

## 8. 建議下一個工程任務

下一個版本應該先做：

1. 改 Email / Google 登入。
2. 新增 organizations / members。
3. 把 RLS 從 owner_id 升級成 organization_id。
4. 做完整 CRUD：編輯、刪除、搜尋、篩選。
5. 做專案詳情頁。

這樣系統才會從「個人版工具」進入「公司內部 ERP」。
