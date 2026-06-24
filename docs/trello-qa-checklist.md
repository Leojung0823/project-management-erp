# Trello Mode QA Checklist

Use this checklist after every meaningful Trello mode change.

## Connection

- [ ] Open `/trello-live.html?v=<new-version>`.
- [ ] Confirm page shows Supabase connected state.
- [ ] Confirm no console error on page load.

## Board basics

- [ ] Create a new board.
- [ ] Rename the board.
- [ ] Create a list.
- [ ] Rename a list.
- [ ] Add a card.
- [ ] Drag a card to another list.
- [ ] Move card up and down.
- [ ] Move list up and down.

## Card details

- [ ] Open card detail modal.
- [ ] Edit title.
- [ ] Edit description.
- [ ] Set due date.
- [ ] Add label.
- [ ] Assign member.
- [ ] Add checklist item.
- [ ] Complete checklist item.
- [ ] Add comment.
- [ ] Archive and restore card.

## Advanced fields

- [ ] Add cover URL.
- [ ] Add attachment link.
- [ ] Add custom field.
- [ ] Add time log.
- [ ] Confirm card badges update.

## Exports and sync

- [ ] Export JSON.
- [ ] Export CSV.
- [ ] Sync cards to ERP tasks.
- [ ] Confirm `erp_records` has `module = tasks` records.

## Storage

- [ ] Run `supabase/trello-storage.sql` before testing upload.
- [ ] Upload file to a card.
- [ ] Confirm file appears in bucket `trello-attachments`.
- [ ] Confirm attachment metadata is written back to the card.

## Final

- [ ] Refresh page and confirm data remains.
- [ ] Open in a new browser session and confirm expected session behavior.
