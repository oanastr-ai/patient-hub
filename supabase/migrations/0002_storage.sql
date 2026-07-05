-- Bucket privat pentru fișierele pacienților (fotografii, radiografii, documente)
insert into storage.buckets (id, name, public)
values ('patient-files', 'patient-files', false)
on conflict (id) do nothing;

-- Politici: doar utilizatorii autentificați ai clinicii pot accesa fișierele
create policy "patient files read" on storage.objects
  for select using (
    bucket_id = 'patient-files' and auth.role() = 'authenticated'
  );

create policy "patient files insert" on storage.objects
  for insert with check (
    bucket_id = 'patient-files' and auth.role() = 'authenticated'
  );

create policy "patient files update" on storage.objects
  for update using (
    bucket_id = 'patient-files' and auth.role() = 'authenticated'
  );

create policy "patient files delete" on storage.objects
  for delete using (
    bucket_id = 'patient-files' and auth.role() = 'authenticated'
  );
