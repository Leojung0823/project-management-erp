# Notification Plan

This document defines the notification strategy for Trello-like due-date reminders.

## Current implementation

The current GitHub Pages version supports frontend-driven reminders:

- due soon panel
- overdue cards
- browser notification permission request
- same-page reminder display

This is useful for MVP testing, but it only works while the user has the page open.

## Production target

Production notifications should use backend scheduled checks.

Recommended architecture:

1. Store notification preferences in Supabase.
2. Run scheduled checks with Supabase Edge Functions or another trusted backend scheduler.
3. Query cards due soon, overdue cards, and assigned members.
4. Insert in-app notifications.
5. Optionally send email or LINE messages.

## Suggested data fields

For each card:

```json
{
  "due": "YYYY-MM-DD",
  "members": ["user-id"],
  "reminders": {
    "enabled": true,
    "beforeDays": [7, 3, 1],
    "lastNotifiedAt": "ISO timestamp"
  }
}
```

For each user:

```json
{
  "notificationChannels": {
    "inApp": true,
    "email": false,
    "line": false
  }
}
```

## Reminder rules

- Notify when card due date is today.
- Notify when card is overdue.
- Notify 7 / 3 / 1 days before due date if enabled.
- Do not notify completed or archived cards.
- Do not send duplicate reminders for the same card and same reminder window.

## In-app notification fields

```json
{
  "id": "uuid",
  "userId": "uuid",
  "boardId": "uuid",
  "cardId": "uuid",
  "type": "due_soon | overdue | mention | assignment",
  "title": "message title",
  "body": "message body",
  "readAt": null,
  "createdAt": "ISO timestamp"
}
```

## Future automation scope

- Daily reminder digest.
- Immediate notification when assigned to a card.
- Immediate notification when mentioned in a comment.
- Weekly project summary.
- Overdue escalation to owner / admin.

## MVP limitation

The current browser notification feature should be documented as a convenience layer, not a reliable background notification system.
