# Trello Permission Plan

This document defines the production permission model for the Trello-like PM ERP board.

## Roles

| Role | Purpose | Allowed actions |
|---|---|---|
| owner | Workspace owner | Full access, billing-level settings, transfer ownership |
| admin | Board / workspace admin | Manage boards, members, labels, lists, cards, settings |
| member | Normal contributor | Create and edit cards, comment, upload attachments, move cards |
| viewer | Read-only user | View boards and cards only |

## Frontend behavior

The frontend should disable or hide actions based on role.

### owner

- Can manage workspace settings.
- Can manage all boards.
- Can manage all members and roles.
- Can delete or archive boards.
- Can export data.

### admin

- Can manage board settings.
- Can add or remove board members.
- Can create, edit, archive, and delete lists.
- Can create, edit, archive, and delete cards.
- Can manage labels and templates.

### member

- Can create and edit cards.
- Can move cards between lists.
- Can comment.
- Can upload attachments.
- Can complete checklist items.
- Cannot change workspace-level settings.
- Cannot change roles.

### viewer

- Can read board, list, and card content.
- Cannot create, edit, move, delete, archive, upload, or comment.

## Suggested Supabase tables

```sql
workspaces
workspace_members
boards
board_members
board_permissions
```

Current MVP stores board data in `erp_records` with module `trello_boards`. A later production migration should move board membership and permissions out of the JSON data and into normalized tables.

## Suggested RLS direction

- A user can read a board if they are a workspace member or board member.
- A user can update a board if they are owner, admin, or member with write access.
- A viewer can only read.
- Storage files should inherit board access.
- Destructive actions should require owner or admin.

## Migration plan

1. Keep current JSON board data working.
2. Add workspace and membership tables.
3. Backfill a default workspace for existing boards.
4. Add board membership rows for existing users.
5. Move role checks from frontend-only to RLS-backed checks.
6. Keep frontend role gating as UX, not as the only security boundary.

## Production warning

Frontend role checks are convenience only. Final security must be enforced by Supabase RLS and Storage policies.
