# Apply this patch

Copy these files into the repository root:

- `tasks.md`
- `package.json`
- `scripts/check-static-site.mjs`
- `docs/trello-dev-notes.md`
- `docs/trello-qa-checklist.md`

Then run:

```bash
npm run test:static
node --check docs/trello-main.js
node --check docs/trello-extra.js
node --check docs/trello-power.js
git add tasks.md package.json scripts/check-static-site.mjs docs/trello-dev-notes.md docs/trello-qa-checklist.md
git commit -m "task: stabilize Trello mode baseline"
```
