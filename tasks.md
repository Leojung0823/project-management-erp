# tasks.md — Trello ERP Agent Loop

## Agent Loop Rules

- [x] Create repo task checklist.
- [x] Work from the first unfinished task only.
- [x] After each task, run static checks when possible.
- [x] Commit after each finished task and mark it `[x]`.
- [x] Continue without asking unless the change deletes production data, needs a paid service, resets Supabase, or can break the production Pages URL.
- [x] ERP business data must stay in Supabase. Browser storage is only for UI preferences and public client settings.

## Phase 15 — Form UX hotfix and next queue

- [x] Fix hidden card submit/save/add buttons in modal and advanced panels.
- [x] Add sticky action helpers for card forms.
- [x] Add mobile bottom spacing so submit buttons are not hidden.
- [x] Add smoke coverage for Phase 15 hotfix files.

## Phase 16 — Profile mapping, Supabase-first mentions, CI smoke

- [x] Add Profile user_id mapping baseline panel.
- [x] Add board profileMap fallback for anonymous compatibility mode.
- [x] Add Supabase-first mention notifications with board JSON fallback.
- [x] Add safe SQL draft for trello member profiles and mention notifications.
- [x] Add GitHub Actions Trello smoke workflow.
- [x] Add CI status panel in the Trello UI.
- [x] Add Phase 16 QA guide.
- [ ] Add strict RLS policies only after access dry-run is clean.
- [ ] Add real profile user_id mapping enforcement for assignments.
- [ ] Add notification inbox backed fully by Supabase tables.
- [ ] Add Playwright proper browser tests if package/dependency installation is approved.

## Phase 17 — Next queue

- [ ] Restore full historical task list into archived planning doc if needed.
- [ ] Add profile-based member picker in all card detail panels.
- [ ] Add Supabase-backed notification center view.
- [ ] Add user mention autocomplete.
- [ ] Add email notification draft for mentions.
- [ ] Add GitHub Actions badge to README.
- [ ] Add Playwright browser workflow after dependency approval.
