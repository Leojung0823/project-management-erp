# tasks.md — Trello ERP Agent Loop

## Agent Loop Rules

- [x] Create repo task checklist.
- [x] Work from the first unfinished task only.
- [x] After each task, run static checks when possible.
- [x] Commit after each finished task and mark it `[x]`.
- [x] Continue without asking unless the change deletes production data, needs a paid service, resets Supabase, or can break the production Pages URL.
- [x] ERP business data must stay in Supabase. Browser storage is only for UI preferences and public client settings.

## Phase 0 — Stabilize current Trello mode

- [x] Create `docs/trello-dev-notes.md` documenting entry points, scripts, Supabase module names, and extension layers.
- [x] Add `scripts/check-static-site.mjs` to verify every local CSS and JS reference in `docs/*.html` exists.
- [x] Add `npm run test:static` to package.json.
- [x] Create `docs/trello-qa-checklist.md` for manual QA.
- [x] Run syntax checks for `docs/trello-main.js`, `docs/trello-extra.js`, and `docs/trello-power.js`.

## Phase 1 — Data model hardening

- [x] Add schemaVersion to Trello board data.
- [x] Add normalizeBoard and normalizeCard notes or implementation.
- [x] Add save queue or debounce plan to avoid overlapping Supabase writes.
- [x] Standardize board activity and card activity shape.

## Phase 2 — Trello interaction polish

- [x] Improve card sorting within the same list.
- [x] Improve cross-list drop position behavior.
- [x] Improve list sorting and archive behavior.
- [x] Add keyboard-friendly quick card creation.

## Phase 3 — Power features

- [x] Complete attachment upload QA notes for Supabase Storage bucket `trello-attachments`.
- [x] Add production-ready permission plan for owner/admin/member/viewer.
- [x] Add notification plan for due-date reminders.
- [x] Add ERP sync mapping documentation.

## Phase 4 — Production readiness

- [x] Confirm SQL files are idempotent or document exceptions.
- [x] Update README with Trello live URL, SQL order, Storage SQL, and common errors.
- [x] Final QA: GitHub Pages Trello URL opens, connects to Supabase, creates cards, edits modal data, exports data, and syncs ERP tasks.

## Phase 5 — Workspace, member role, and sync status foundation

- [x] Implement real workspace tables and member roles in `supabase/trello-workspace-schema.sql`.
- [x] Add owner-scoped RLS policy foundation for workspace tables while keeping the live board backward compatible.
- [x] Add invite flow for workspace members in the Trello UI extension.
- [x] Add due-date reminder registration table and UI action for backend scheduling preparation.
- [x] Add full ERP task sync status panel.
- [x] Add production regression test checklist panel for every release.

## Phase 6 — Auth bridge, reminder worker draft, and smoke test

- [x] Add Email and Google login panel while retaining anonymous fallback for backward compatibility.
- [x] Add account status panel and profile sync to workspace data.
- [x] Add `supabase/trello-auth-schema.sql` safe auth foundation draft.
- [x] Add deployable due-date reminder Edge Function draft. Deployment in Supabase is still a manual production step.
- [x] Add Supabase Storage attachment delete and role-based delete checks.
- [x] Add automated static smoke test for `docs/trello-live.html` extension loading.
- [ ] Enforce workspace-level board access on `erp_records` after real login is fully live.

## Phase 7 — Invitation acceptance and migration preparation

- [ ] Upgrade `erp_records` access model from compatibility mode to workspace-scoped mode.
- [x] Add real invitation acceptance flow from email link.
- [x] Add admin dashboard for user access review.
- [ ] Add browser-based QA automation with Playwright or equivalent.
- [x] Add production migration guide for switching from anonymous compatibility mode to strict login mode.

## Phase 8 — Next implementation queue

- [ ] Add browser-based QA automation.
- [ ] Add strict access dry-run report before enabling workspace-only board records.
- [ ] Add production migration SQL for workspace-scoped board access.
- [ ] Add release notes page for Trello pro mode.
