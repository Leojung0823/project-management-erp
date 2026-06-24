# Trello Workspace / Member / Role Implementation

## Current safe rollout

The live Trello board currently stores board data in `erp_records` with module `trello_boards`.

Phase 5 adds a real workspace foundation without breaking the current working GitHub Pages app:

1. `supabase/trello-workspace-schema.sql` creates workspace/member/board-member/reminder tables.
2. `docs/trello-phase5.js` adds a workspace drawer, invite flow, and ERP sync status panel.
3. Live board data still works even if the new SQL has not been executed yet.

## SQL execution order

Run these in Supabase SQL Editor:

```sql
supabase/full-suite-schema.sql
supabase/trello-storage.sql
supabase/trello-workspace-schema.sql
```

## Role model

| Role | Purpose |
| --- | --- |
| owner | Owns workspace and can manage every setting. |
| admin | Can manage members, labels, lists, and board settings. |
| member | Can create and update cards. |
| viewer | Can view board data only. |

## Permission rollout

The current app remains frontend-first for safety. The new workspace tables use owner-scoped RLS so every signed-in user can only manage their own workspace rows.

Next production step is to connect `erp_records.data.workspaceId` and `erp_records.data.boardId` into a stricter workspace-aware policy after real user accounts replace anonymous sign-in.

## Invite flow

Phase 5 invite flow records pending members in two places:

- the board data under `workspace.invites`
- `trello_workspace_members` when the SQL table exists

No email is sent yet. Email delivery should be handled later by Supabase Edge Function or another notification provider.

## Regression checks

After this phase:

- Trello board must still open without running the new SQL.
- If the new SQL has been run, workspace rows should be written successfully.
- Sync status panel should show ERP task sync counts.
- Existing board, card, attachment, and export functions must continue working.
