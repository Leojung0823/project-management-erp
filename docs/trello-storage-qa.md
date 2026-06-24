# Trello Storage QA Notes

This file documents the manual QA flow for card attachments that use Supabase Storage.

## Storage bucket

Bucket name:

```text
trello-attachments
```

Required SQL file:

```text
supabase/trello-storage.sql
```

Run the SQL before testing file uploads.

## Manual QA checklist

- [ ] Open `docs/trello-live.html` through GitHub Pages.
- [ ] Confirm the board connects to Supabase.
- [ ] Create a new board or use an existing board.
- [ ] Create a new card.
- [ ] Open the card detail modal.
- [ ] Use the Power-Up attachment upload control.
- [ ] Upload a small image file.
- [ ] Confirm upload success message appears.
- [ ] Confirm the attachment appears on the card.
- [ ] Refresh the page.
- [ ] Confirm the uploaded attachment metadata is still visible.
- [ ] Open the Storage bucket in Supabase and confirm the uploaded file exists.
- [ ] Delete the attachment from the card if the UI supports deletion.
- [ ] Confirm the card data is saved after deletion.

## Expected data shape

Each uploaded attachment should be stored in card data like this:

```json
{
  "id": "uuid",
  "name": "filename.png",
  "path": "board-id/card-id/filename.png",
  "url": "public-or-signed-url",
  "size": 12345,
  "type": "image/png",
  "uploadedBy": "me",
  "uploadedAt": "ISO timestamp"
}
```

## Failure cases to test

- [ ] Upload without running `supabase/trello-storage.sql`.
- [ ] Upload file larger than the configured project limit.
- [ ] Upload while offline.
- [ ] Refresh during upload.
- [ ] Upload a filename with spaces and Chinese characters.

## Current limitation

The current GitHub Pages version is still frontend-driven. Full background virus scanning, private signed URL rotation, and organization-level Storage isolation should be handled in a later production phase.
