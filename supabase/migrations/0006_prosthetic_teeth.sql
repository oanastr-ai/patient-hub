-- Lucrările protetice reținau doar data, planul, materialul, culoarea și
-- tehnicianul — fără dinți, deci nu puteau actualiza odontograma.
--
-- `work_type` e necesar pe lângă dinți: `plan` e text liber, din care nu se
-- poate deduce ce stare produce lucrarea pe dinte.

alter table public.prosthetic_works
  add column if not exists tooth_codes text[] not null default '{}',
  add column if not exists work_type text;

alter table public.prosthetic_works
  drop constraint if exists prosthetic_works_work_type_check;

alter table public.prosthetic_works
  add constraint prosthetic_works_work_type_check check (
    work_type is null or work_type in (
      'crown', 'bridge_pontic', 'veneer', 'denture', 'implant', 'implant_crown'
    )
  );

comment on column public.prosthetic_works.tooth_codes is
  'Dinții pe care se aplică lucrarea, în notație FDI.';
comment on column public.prosthetic_works.work_type is
  'Starea pe care o produce lucrarea pe odontogramă; null = doar consemnare.';
