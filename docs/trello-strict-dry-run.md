# Trello Strict Access Dry-run Report

This document describes the safe dry-run step before enabling strict workspace-only access.

## Goal

The dry-run report checks whether current Trello boards can safely move from compatibility mode to workspace-scoped access.

It does not lock records, delete data, or change access rules.

## What the dry-run checks

- How many Trello boards exist.
- Whether each board has workspace members.
- Whether each board has at least one owner.
- Whether the current signed-in user is listed in the workspace members.
- Whether the current user can read or write after strict mode.
- Whether there are pending invitations.
- Whether cards are assigned to names that are not in the workspace member list.
- Whether unknown roles exist.

## How to use

Open the live Trello page:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-10
```

Then click:

```text
Strict 乾跑
```

You can also open the report automatically with:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-10&strictDryRun=1
```

## Safe criteria before strict mode

Before enabling strict workspace-only access, every production board should meet these conditions:

- The board has at least one workspace member.
- The board has exactly one primary owner or a clearly intentional owner group.
- The production administrator can read and edit the board after signing in.
- All invited users have accepted invitations or are intentionally pending.
- Card assignees are reflected in workspace members.
- No unknown role exists.

## What to do with warnings

If the report shows warnings:

1. Add the missing owner.
2. Ask invited members to sign in and accept invitation.
3. Fix role names to owner, admin, member, or viewer.
4. Add missing assignees to workspace members or remove the stale card assignment.
5. Run the dry-run report again.

## Next step after dry-run is clean

Only after the report is clean should the project move to strict access migration.

The strict migration should be a separate phase and should include a rollback plan.
