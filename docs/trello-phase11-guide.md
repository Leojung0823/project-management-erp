# Trello Phase 11 — Realtime / Automation / Notification Center

Phase 11 turns the Trello-like ERP board from a static single-user board into a collaboration-ready board.

## Entry point

Use a cache-busted URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-13
```

## What Phase 11 adds

- Supabase Realtime subscription for `erp_records` Trello board updates.
- Notification Center for due reminders, realtime update notices, and automation results.
- Butler-lite automation rules.
- Sync status bar for non-disruptive updates.
- Manual due-date scan.
- Manual automation execution.
- Local notification persistence with a path toward Supabase-backed notifications.

## Realtime behavior

Phase 11 subscribes to `erp_records` changes where `module = trello_boards`.

When another device updates the active board:

1. A notification is added.
2. A bottom sync status appears.
3. If no card modal is open, the user can click the sync message to reload.
4. If a modal is open, Phase 11 avoids hard-refreshing the editor to prevent losing input.

This is intentionally conservative. It avoids overwriting local edits while the user is working.

## Notification Center

Open from the top toolbar: `通知中心`.

Notification types:

- `due`: due soon or overdue cards.
- `realtime`: board changed from another device.
- `automation`: automation rule run result.
- `info`: generic notices.

Notifications are stored locally first so the feature works before production SQL is applied.

To prepare for Supabase-backed notifications, run:

```text
supabase/trello-automation-notifications.sql
```

## Automation Lite

Open from the top toolbar: `Automation`.

Default rules:

1. Cards moved into a Done/完成 list get `completedAt`.
2. Overdue cards are marked high priority.
3. Checklist-complete cards can receive a `完成` label.
4. Done-list cards can sync to ERP tasks.

Rules are stored in `board.automationRules` to keep compatibility with the current board record.

## QA checklist

### Realtime

- Open the board in two browser windows.
- Edit a card in window A.
- Window B should show a realtime notice or sync status.
- Opening a card modal should not be force-refreshed.

### Notification center

- Add a card due today or overdue.
- Click `通知中心`.
- Click `掃描到期`.
- Confirm new due notifications appear.
- Mark all as read and verify badge count disappears.

### Automation

- Create or move a card into `完成`.
- Open `Automation`.
- Click `立即執行規則`.
- Confirm the card gets completion metadata and board activity.
- Confirm overdue card priority becomes `高`.

### Safety

- No rule deletes cards, lists, boards, or Supabase records.
- Strict access is still dry-run only.
- ERP sync is idempotent by card id / `erpTaskId`.
