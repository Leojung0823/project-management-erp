# Trello Mode Development Notes

## Live entry

Primary GitHub Pages entry:

```text
/docs/trello-live.html
```

Current loading order:

1. `trello.css`
2. `trello-extra.css`
3. `trello-power.css`
4. Supabase JS CDN
5. `trello-main.js`
6. `trello-extra.js`
7. `trello-power.js`

## Data storage

Business data is stored in Supabase table `erp_records`.

Trello board records use:

```text
module = trello_boards
```

ERP synced task records use:

```text
module = tasks
```

Storage bucket for uploaded attachments:

```text
trello-attachments
```

## Extension layers

`trello-main.js` is the core board application. It owns board rendering, list/card CRUD, modal, labels, members, checklists, comments, archived cards, board/table/calendar views, and Supabase persistence.

`trello-extra.js` is the advanced card layer. It adds JSON/CSV export, ERP task sync, card cover URL, attachment links, custom fields, time logs, and related badges.

`trello-power.js` is the power-up layer. It adds reminders, browser notifications, Supabase Storage upload, board roles, board permission notes, and extra card panel UI.

## Development guardrails

- Do not store ERP business records in browser-only storage.
- Keep `trello-live.html` backward compatible.
- Prefer additive extension files when possible.
- If replacing `trello-main.js`, keep the same public selectors used by extension files.
- Do not break current Supabase anonymous sign-in flow.
