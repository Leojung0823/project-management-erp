# Project ERP Full Suite v3 Runbook

## Current production entry

- Home: `https://leojung0823.github.io/project-management-erp/`
- v3 entry: `https://leojung0823.github.io/project-management-erp/full-suite-v3.html?v=full-suite-2026-06-24-3`
- Version marker: `https://leojung0823.github.io/project-management-erp/version-v3.txt`

## Supabase SQL run order

Run these in Supabase SQL Editor:

1. `supabase/full-suite-schema.sql`
2. `supabase/full-suite-enterprise-schema.sql`
3. `supabase/full-suite-reporting-views.sql`

## Required Supabase settings

- Authentication: enable Anonymous Sign-Ins for the temporary MVP flow.
- Use Project URL and Publishable key only.
- Do not use Secret key or service_role key in the browser.

## v3 modules

The app supports the following modules through `erp_records`:

- dashboard
- team_roles
- clients
- contacts
- opportunities
- quotations
- contracts
- projects
- milestones
- tasks
- timesheets
- risks
- issues
- change_requests
- meetings
- approvals
- invoices
- payments
- expenses
- purchases
- documents
- notifications
- activity

## Verification checklist

1. Open `/full-suite-v3.html`.
2. Paste Supabase URL and Publishable key.
3. Confirm the app enters Supabase connected mode.
4. Create a client.
5. Create a project.
6. Create a task and move status to processing / review / completed.
7. Create an invoice and a payment.
8. Check KPI cards update.
9. Check audit log records create/update/delete actions.
10. Export JSON backup.
11. Import JSON backup into a new Supabase test project if needed.

## Known architecture note

v3 still uses a flexible `erp_records` JSONB store for speed. The enterprise extension adds organization and member tables for the next step. The next major upgrade should move high-risk finance and permission data from generic JSONB into typed tables.
