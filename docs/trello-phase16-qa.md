# Trello Phase 16 QA — Profile Mapping, Supabase Mentions, CI Smoke

Use this URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-18
```

## Entry points

Confirm the top action area shows:

- Profile對應
- Supabase提及
- CI狀態

## Profile mapping

Test:

1. Open Profile對應.
2. Check login state.
3. Click 同步目前登入者.

Expected:

- If logged in, user id and email are mapped into `board.profileMap`.
- If `trello_member_profiles` table exists, it also attempts to sync there.
- If table is missing, the UI should show a table-missing message and continue using board JSON fallback.

## Supabase-first mentions

Test:

1. Run `supabase/trello-mentions-profiles-safe.sql` in Supabase SQL Editor.
2. Open Supabase提及.
3. Select a card.
4. Type a comment like `@Leo 請確認`.
5. Click 送出並建立通知.

Expected:

- Comment is added to the card.
- Mention notification is inserted into `trello_mention_notifications` when the table exists.
- If the table does not exist, it falls back to `board.mentionNotifications`.

## CI status

Test:

1. Open CI狀態.
2. Confirm the smoke commands are shown.
3. In GitHub Actions, confirm `.github/workflows/trello-smoke.yml` exists.

Expected commands:

```text
npm run test:static
npm run test:smoke
npm run test:trello-phases
```

## Regression checks

After Phase 16, test:

- Card modal buttons are still visible.
- Card Detail Pro still saves data.
- @提及 from Phase 14 still works.
- Supabase提及 works with or without the SQL table.
- Timeline, Dashboard, Templates, Import, and Gantt suggestions still open.

## Known limitations

- Mention routing is still partly name-based until strict login and profile mapping are fully enforced.
- Supabase mention tables use a safe compatibility schema, not final strict RLS.
- GitHub Actions smoke workflow is static / script-level, not full Playwright browser automation yet.
