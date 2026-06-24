# Project ERP Full Suite v3 QA Test Cases

## A. Environment

| ID | Test | Expected |
|---|---|---|
| A1 | Open `/version-v3.txt` | Shows `full-suite-2026-06-24-3` |
| A2 | Open `/full-suite-v3.html` | Loads app shell without console-blocking error |
| A3 | Open home `/` | Shows link to v3 entry |
| A4 | Use mobile width | Sidebar and content remain usable |

## B. Supabase connection

| ID | Test | Expected |
|---|---|---|
| B1 | Paste valid URL and Publishable key | App connects and loads dashboard |
| B2 | Paste invalid key | Shows Chinese error message |
| B3 | Do not run SQL and connect | Shows missing `erp_records` / SQL reminder |
| B4 | Clear connection | App returns to connection screen |

## C. CRUD modules

Run create, edit, status change, delete for each module:

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

Expected for each:

1. New record appears in list.
2. Edit updates list.
3. Status change persists after refresh.
4. Delete removes record.
5. Audit log has action record.

## D. Dashboard

| ID | Test | Expected |
|---|---|---|
| D1 | Create project | Project KPI increases |
| D2 | Create task | Task KPI increases |
| D3 | Create invoice | Receivable KPI changes |
| D4 | Create payment | Paid KPI changes |
| D5 | Create expense | Expense and margin KPI changes |
| D6 | Create risk | Risk KPI changes |

## E. Backup

| ID | Test | Expected |
|---|---|---|
| E1 | Export JSON | Download contains records and generatedAt |
| E2 | Import JSON | Records are restored to Supabase |
| E3 | Seed demo data | Demo records created across modules |

## F. Security

| ID | Test | Expected |
|---|---|---|
| F1 | Use Project URL and Publishable key | Works |
| F2 | Do not expose Secret key | No secret stored in repo |
| F3 | New anonymous user | Cannot see another user's records |
| F4 | RLS enabled | Direct unauthenticated access blocked |
