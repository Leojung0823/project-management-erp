# Trello Phase 12 QA — Advanced Trello Gap Closure

Phase 12 focuses on visible product gaps rather than database security changes.

## New entry points

Open the Trello board and confirm these buttons exist in the top action area:

- 卡片詳情Pro
- Timeline
- Dashboard
- Inbox
- 進階篩選
- Power-Up

Use a cache-busting URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-14
```

## Card Detail Pro

Check:

1. Open Card Detail Pro.
2. Switch between cards using the selector.
3. Edit title, description, due date, and priority.
4. Add checklist items.
5. Check / uncheck checklist items.
6. Add comments.
7. Add attachment links.
8. Add custom fields.
9. Copy card link.

Expected result:

- Board data remains in Supabase `erp_records` / `trello_boards`.
- Card changes should persist after reload.
- Detail panel should not replace the original modal; it is an advanced side-product layer.

## Timeline / Gantt Lite

Check:

1. Add due dates to several cards.
2. Open Timeline.
3. Confirm cards are sorted by due date.
4. Confirm overdue cards are visually marked.

This is a lightweight timeline, not a full dependency scheduler yet.

## Dashboard

Check:

- Total card count
- Overdue count
- Completed card count
- Completion rate
- Workload by member
- Overdue card list with open buttons

## Global Inbox

Check tabs:

- 即將到期
- 指派給我
- 最近更新

The assigned-to-me tab currently uses the local display name fallback. It should later be tied to real authenticated user profiles.

## Advanced filters

Check filters:

- 逾期
- 未指派
- 無到期日
- 有附件
- 已同步 ERP
- 清除篩選

Expected result:

- Filtering hides non-matching cards visually only.
- No board data should be deleted.

## ERP Power-Up Center

Check:

- Customers
- Quotations
- Invoices / Billing
- Project Costs
- Google Calendar
- File Library

Expected result:

- Power-Up enablement is saved under `board.powerUps`.
- This is a foundation for ERP module linking; it does not yet create full ERP records for each Power-Up.

## Known gaps after Phase 12

- No full Trello JSON import compatibility yet.
- No full Gantt dependencies yet.
- No real mention system yet.
- No Supabase-first notification center yet.
- No strict workspace-only access until dry-run reports are clean.
