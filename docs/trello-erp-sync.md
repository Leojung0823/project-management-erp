# Trello to ERP Sync Mapping

This document explains how Trello-like cards should sync into PM ERP records.

## Current storage

Trello boards are stored in:

```text
erp_records.module = trello_boards
```

ERP tasks are stored in:

```text
erp_records.module = tasks
```

## Sync direction

Initial production sync is one-way:

```text
Trello card -> ERP task
```

A later phase can support two-way sync after conflict rules are defined.

## Idempotency rule

Each Trello card should store:

```json
{
  "erpTaskId": "uuid",
  "lastSyncedAt": "ISO timestamp"
}
```

If `erpTaskId` exists, update that ERP task instead of creating a new task.

If `erpTaskId` is missing, create a new ERP task and write the new task id back to the Trello card.

## Field mapping

| Trello card | ERP task |
|---|---|
| card title | 任務名稱 |
| card description | 說明 |
| list title | 狀態 |
| due date | 期限 |
| members | 負責人 |
| labels | 標籤 |
| checklist | 檢查清單 |
| comments summary | 備註 |
| attachments metadata | 附件 |
| time logs | 工時 |
| priority | 優先級 |
| board title | 專案 |

## Suggested ERP task data

```json
{
  "任務名稱": "Card title",
  "專案": "Board title",
  "狀態": "List title",
  "負責人": "Leo, PM",
  "優先級": "高",
  "期限": "YYYY-MM-DD",
  "說明": "Card description",
  "檢查清單": "item 1, item 2",
  "標籤": "急件, 客戶",
  "工時": "3.5",
  "來源": "trello",
  "trelloCardId": "card uuid",
  "trelloBoardId": "board uuid"
}
```

## Sync result summary

A sync operation should report:

- created count
- updated count
- skipped count
- failed count
- failed card titles and error messages

## Conflict policy

For MVP, Trello is source of truth. Sync overwrites ERP task fields that are mapped from Trello.

Future two-way sync should add:

- last writer wins policy
- manual conflict review
- field-level sync control
- sync history

## Audit requirements

Each sync should write activity to:

- board activity
- card activity
- ERP task activity if available

## QA checklist

- [ ] Sync one new card to ERP task.
- [ ] Sync the same card again and confirm it updates the same ERP task.
- [ ] Change card title and sync again.
- [ ] Change due date and sync again.
- [ ] Add labels and members, then sync.
- [ ] Confirm no duplicate task is created.
