# Trello Pro Mode Release Notes

Current production channel: `pro-10`

Live page:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html?v=20260624-pro-10
```

Release notes page:

```text
https://leojung0823.github.io/project-management-erp/trello-release-notes.html
```

## pro-10 — Strict access dry-run

- Added strict access dry-run panel.
- Added dry-run JSON export.
- Checks board owners, workspace members, inactive invites, unknown roles, current user read/write impact, and card assignment risks.
- Does not enable strict access yet.

## pro-9 — Invitation acceptance

- Added invitation link generation.
- Added invitation acceptance flow.
- Added access review dashboard.
- Added strict login migration guide.

## pro-8 — Auth bridge

- Added Email signup/login.
- Added Google login button.
- Added logout and account status panel.
- Added login profile sync.
- Added due reminder worker draft.
- Anonymous compatibility remains enabled.

## pro-7 — Workspace foundation

- Added workspace tables.
- Added workspace member and board member tables.
- Added due notification registration table.
- Added workspace settings drawer and role UI.
- Added ERP task sync status panel.

## pro-6 — Interaction polish

- Improved same-list card sorting.
- Improved cross-list drop position behavior.
- Added quick card creation.
- Added list archive and restore extension.

## pro-5 — Data hardening

- Added board schema version.
- Added normalization for boards and cards.
- Added activity shape standardization.
- Added save queue for Supabase writes.

## Strict access rule

Strict workspace-only access must not be enabled until dry-run reports show no blocking risks.

Before strict access migration:

- Every active board must have at least one owner.
- Every active member must be able to sign in.
- Pending invites must be reviewed.
- Unknown roles must be fixed.
- The current user must keep read/write access to production boards.

## Rollback

If strict access migration is applied later and causes access issues, use:

```text
supabase/trello-strict-access-rollback.sql
```
