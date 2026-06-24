# Trello Strict Login Migration Guide

This guide explains how to move from anonymous compatibility mode to strict login mode without locking users out.

## Current mode

The live board still supports anonymous sessions so existing GitHub Pages users can open the board while auth is being introduced.

## Safe migration order

1. Run `supabase/trello-workspace-schema.sql`.
2. Run `supabase/trello-auth-schema.sql`.
3. Open the live Trello page and sign in with Email or Google.
4. Use the Phase 7 `產生邀請` button to create member invitation links.
5. Ask each user to open the invite link while signed in.
6. Confirm every expected user appears in `權限審查`.
7. Review role assignments: owner, admin, member, viewer.
8. Only after all users are confirmed, prepare the strict access migration.

## Do not do yet

Do not force `erp_records` RLS to workspace-only access until all active boards have workspace members and at least one owner.

## Acceptance checklist

- Owner can sign in and open the board.
- Admin can invite members.
- Member can open accepted boards.
- Viewer can be listed in workspace members.
- Pending invites are visible in access review.
- Existing anonymous data remains readable before strict mode is enabled.

## Future strict mode

Strict mode should move boards from compatibility records to workspace-scoped records and enforce access at the database level. Until then, front-end role checks are treated as a transition layer, not final security.
