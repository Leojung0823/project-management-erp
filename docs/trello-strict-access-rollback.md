# Trello Strict Access Rollback Plan

This document describes the recovery path if a future strict workspace-only access migration blocks valid users.

Current status:

- Strict access is not enabled by default.
- `pro-10` only provides dry-run reporting.
- Rollback SQL is provided as a draft for future migration safety.

## When to use rollback

Use rollback only after a strict access migration has actually been applied and one of these happens:

- The owner can no longer see a board.
- Workspace members cannot open boards they should access.
- Anonymous compatibility was removed too early.
- Dry-run warnings were ignored and production users are blocked.

Do not run rollback during normal pro-10 usage.

## Before rollback

1. Export all Trello boards from the app.
2. Download the strict dry-run report JSON.
3. Confirm the current problem is access-related, not GitHub Pages cache or Supabase outage.
4. Record which SQL migration was applied.

## Rollback file

SQL draft:

```text
supabase/trello-strict-access-rollback.sql
```

The rollback draft is intentionally conservative. It drops expected strict access policies if they exist, then restores owner-based compatibility policies for `erp_records` and `erp_activity` if missing.

## After rollback

1. Reopen the live page with a new version query string.
2. Confirm owners can read and write boards again.
3. Confirm workspace settings and invitations still exist.
4. Run dry-run again and fix warnings before any future strict migration.

## Safer strict migration sequence

1. Keep compatibility mode on.
2. Run dry-run.
3. Fix all owner/member/role issues.
4. Export a dry-run report.
5. Apply strict migration in staging or duplicate Supabase project first.
6. Test login, board open, card create, card edit, attachment upload, ERP sync.
7. Only then apply strict migration to production.
