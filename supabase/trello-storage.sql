-- PM ERP Trello attachments storage setup
-- Run this in Supabase SQL Editor before using the file upload Power-Up.

insert into storage.buckets (id, name, public)
values ('trello-attachments', 'trello-attachments', true)
on conflict (id) do update set public = true;

create policy if not exists trello_attachments_select
on storage.objects
for select
using (bucket_id = 'trello-attachments');

create policy if not exists trello_attachments_insert
on storage.objects
for insert
with check (bucket_id = 'trello-attachments' and auth.uid() is not null);

create policy if not exists trello_attachments_update
on storage.objects
for update
using (bucket_id = 'trello-attachments' and auth.uid() is not null)
with check (bucket_id = 'trello-attachments' and auth.uid() is not null);

create policy if not exists trello_attachments_delete
on storage.objects
for delete
using (bucket_id = 'trello-attachments' and auth.uid() is not null);
