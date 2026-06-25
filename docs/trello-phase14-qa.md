# Trello Phase 14 QA — Mentions, Assignment, Deep Import, Gantt Suggestions

Use this URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-16
```

## Entry points

Confirm the top action area shows:

- @提及
- 指派
- 深度匯入
- Gantt建議
- 模板預覽

## @mention

Test:

1. Open @提及.
2. Select a card.
3. Type a comment such as `@Leo 請確認報價`.
4. Save.

Expected:

- The comment is appended to the selected card.
- `board.mentionNotifications` gets a notification item.
- Mentions are parsed from `@name` patterns.

Known limitation:

- Mention routing is name-based for now. It will use authenticated profile IDs after strict auth is live.

## Assignment

Test:

1. Open 指派.
2. Pick a card and member.
3. Assign.

Expected:

- The member is appended to `card.members`.
- The assignment overview updates.
- No other card data is removed.

## Deep Trello JSON import

Test:

1. Open 深度匯入.
2. Click 填入深度範例.
3. Click 深度預覽.
4. Confirm cards, checklists, comments, and attachments are counted.
5. Import as a new board.

Expected:

- New board is created in Supabase `erp_records` as `trello_boards`.
- `lists`, `cards`, `labels`, `members`, `checklists`, `commentCard actions`, and `attachments` are converted.
- Closed cards/lists are skipped.

Known limitation:

- Some Trello Power-Up data and advanced custom fields may still need mapping rules.

## Gantt suggestions

Test:

1. Create dependencies in Phase 13 相依關係.
2. Open Gantt建議.
3. Check cards with predecessor due dates.
4. Apply suggested date.

Expected:

- Successor due date can be set to predecessor due date + 1 day.
- Date conflicts are marked.
- This does not enforce scheduling yet; it only suggests safe dates.

## Template preview

Test:

- Open 模板預覽.
- Confirm template gallery cards are visible.

This is a preview layer for richer template gallery thumbnails.

## Regression checks

After Phase 14, test:

- Create a card.
- Edit a card.
- Open Card Detail Pro.
- Run Dashboard.
- Run Timeline.
- Run Automation.
- Export JSON.
- Sync ERP tasks.
