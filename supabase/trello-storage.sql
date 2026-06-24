-- PM ERP Trello attachments storage setup
-- Run this in Supabase SQL Editor before using the file upload Power-Up.
-- This file is designed to be safe to re-run.

insert into storage.buckets (id, name, public)
values ('trello-attachments', 'trello-attachments', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'trello_attachments_select') then
    create policy trello_attachments_select
    on storage.objects
    for select
    using (bucket_id = 'trello-attachments');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'trello_attachments_insert') then
    create policy trello_attachments_insert
    on storage.objects
    for insert
    with check (bucket_id = 'trello-attachments' and auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'trello_attachments_update') then
    create policy trello_attachments_update
    on storage.objects
    for update
    using (bucket_id = 'trello-attachments' and auth.uid() is not null)
    with check (bucket_id = 'trello-attachments' and auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'trello_attachments_delete') then
    create policy trello_attachments_delete
    on storage.objects
    for delete
    using (bucket_id = 'trello-attachments' and auth.uid() is not null);
  end if;
end
$$;
