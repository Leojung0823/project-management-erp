# Trello Auth Setup

This document upgrades the Trello-like PM ERP from anonymous-only access to a real account flow while keeping the current live board backward compatible.

## Current safe behavior

- The live page may still create an anonymous Supabase session when no user is signed in.
- Real users can sign in with email/password after Email Auth is enabled in Supabase.
- Google sign-in is supported by the Phase 6 front-end panel when Google Provider is configured.
- Existing boards in `erp_records` remain readable by the existing client until RLS is tightened in a later phase.

## Supabase dashboard settings

In Supabase Dashboard, open Authentication settings and confirm:

1. Email provider is enabled.
2. Confirm email setting is chosen intentionally for your deployment.
3. Site URL is set to the GitHub Pages URL.
4. Redirect URL includes the Trello live page URL.
5. Google provider is enabled only after OAuth Client ID and Client Secret are configured in Supabase Dashboard.

Suggested redirect URL:

```text
https://leojung0823.github.io/project-management-erp/trello-live.html
```

## SQL to run

Run this file in Supabase SQL Editor:

```text
supabase/trello-auth-schema.sql
```

This creates a lightweight user profile table and login event table used by the front-end account panel.

## Front-end behavior

The Phase 6 extension adds an account panel to Trello mode:

- Shows current Supabase user.
- Supports email sign-up.
- Supports email sign-in.
- Supports Google sign-in.
- Supports sign-out.
- Writes a profile row when the profile table exists.
- Updates workspace member rows with the authenticated user id when possible.

## Important production note

Do not enforce strict workspace RLS on `erp_records` until all active users can sign in. The current deployment keeps backward compatibility and adds real-login capability first.
