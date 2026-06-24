# Trello Phase 13 QA — Templates, Import, Dependencies, Conflict UI

Use this cache-busting URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-15
```

## Entry points

Confirm the following buttons are visible:

- 模板
- 匯入Trello
- 相依關係
- 衝突處理

## Board templates

Test each preset:

- 軟體開發 Sprint
- 業務案件追蹤
- 內容製作流程
- 採購與交付
- 扶輪活動專案
- 空白看板

Expected:

- A new board is created in Supabase `erp_records` with module `trello_boards`.
- The new board becomes the active board.
- Lists and starter cards are generated.
- Existing boards are not deleted.

## Trello JSON import

Test:

1. Open 匯入Trello.
2. Click 填入範例.
3. Click 產生預覽.
4. Confirm list and card counts.
5. Click 匯入成新看板.

Expected:

- A new board is created.
- Trello `lists`, `cards`, `labels`, and `members` are converted into the internal board shape.
- Closed Trello lists/cards are ignored.

Known limitation:

- This is not full Trello parity yet. Attachments, checklists, comments, custom fields, and Power-Ups need a deeper importer in a later phase.

## Card dependencies

Test:

1. Open 相依關係.
2. Pick a predecessor card and a successor card.
3. Choose relation type: blocks / relates / duplicates.
4. Add relation.
5. Delete relation.

Expected:

- Relations are stored under `board.dependencies`.
- No card is deleted.
- This is Gantt foundation data only; it does not yet enforce scheduling.

## Conflict UI

Test:

1. Open 衝突處理.
2. Save local draft snapshot.
3. Confirm snapshot appears in the panel.
4. Clear snapshot.

Expected:

- Draft snapshots are local safety backups.
- They do not replace Supabase data.
- True field-level merge UI is still a future phase.

## Regression checks

After Phase 13, confirm existing features still work:

- Card create/edit
- Drag card between lists
- Notification Center
- Automation Lite
- Timeline
- Dashboard
- Card Detail Pro
- Export JSON / CSV
- ERP task sync
