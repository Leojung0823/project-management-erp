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

- [ ] Complete attachment upload QA notes for Supabase Storage bucket `trello-attachments`.
- [ ] Add production-ready permission plan for owner/admin/member/viewer.
- [ ] Add notification plan for due-date reminders.
- [ ] Add ERP sync mapping documentation.

## Phase 4 — Production readiness

- [ ] Confirm SQL files are idempotent or document exceptions.
- [ ] Update README with Trello live URL, SQL order, Storage SQL, and common errors.
- [ ] Final QA: GitHub Pages Trello URL opens, connects to Supabase, creates cards, edits modal data, exports data, and syncs ERP tasks.
