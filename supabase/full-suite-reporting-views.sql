-- Project ERP reporting views
-- Run after supabase/full-suite-schema.sql.

create or replace view public.erp_record_summary as
select
  owner_id,
  module,
  count(*) as total_count,
  count(*) filter (where coalesce(data->>'status','') in ('處理中','待審核','逾期')) as open_count,
  count(*) filter (where coalesce(data->>'status','') = '已完成') as done_count,
  max(updated_at) as last_updated_at
from public.erp_records
group by owner_id, module;

create or replace view public.erp_project_finance_summary as
select
  owner_id,
  coalesce(sum(case when module = 'invoices' then nullif(data->>'金額','')::numeric else 0 end),0) as invoice_total,
  coalesce(sum(case when module = 'payments' then nullif(data->>'金額','')::numeric else 0 end),0) as payment_total,
  coalesce(sum(case when module = 'expenses' then nullif(data->>'金額','')::numeric else 0 end),0) as expense_total,
  coalesce(sum(case when module = 'purchases' then nullif(data->>'金額','')::numeric else 0 end),0) as purchase_total
from public.erp_records
group by owner_id;

create or replace view public.erp_task_summary as
select
  owner_id,
  coalesce(data->>'status','新建') as status,
  count(*) as total_count
from public.erp_records
where module = 'tasks'
group by owner_id, coalesce(data->>'status','新建');
