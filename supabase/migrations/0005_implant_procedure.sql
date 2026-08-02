-- Catalogul avea „Coroană pe implant" și „All-on-X", dar nicio manoperă pentru
-- inserarea fixturii. Fără ea, faza chirurgicală a unui implant nu se putea
-- înregistra, iar odontograma nu putea arăta implantul înainte de protezare.
insert into public.procedures (clinic_id, category_id, name_ro)
select null, '10000000-0000-0000-0000-000000000003', 'Implant'
where not exists (
  select 1 from public.procedures
  where clinic_id is null and lower(name_ro) = 'implant'
);
