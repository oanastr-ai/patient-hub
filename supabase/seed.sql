-- Patient Hub — seed data
-- Clinica, categoriile de manopere principale și manoperele secundare built-in.

insert into public.clinics (id, name, settings) values (
  '00000000-0000-0000-0000-000000000001',
  'Cabinet Stomatologic Dr. Oana Vlad',
  '{"disclaimer_ro": "Costurile menționate pot suferi modificări în funcție de evoluția tratamentelor."}'::jsonb
);

insert into public.doctors (clinic_id, full_name, is_collaborator) values
  ('00000000-0000-0000-0000-000000000001', 'Dr. Oana Vlad', false);

-- Categorii de manopere principale
insert into public.procedure_categories (id, code, name_ro, sort_order) values
  ('10000000-0000-0000-0000-000000000001', 'odontal',     'Tratamente odontale',      1),
  ('10000000-0000-0000-0000-000000000002', 'parodontal',  'Tratamente parodontale',   2),
  ('10000000-0000-0000-0000-000000000003', 'chirurgical', 'Tratamente chirurgicale',  3),
  ('10000000-0000-0000-0000-000000000004', 'protetic',    'Lucrări protetice',        4),
  ('10000000-0000-0000-0000-000000000005', 'ortodontie',  'Ortodonție',               5);

-- Manopere secundare built-in (clinic_id null = disponibile global)
insert into public.procedures (clinic_id, category_id, name_ro) values
  -- Odontale
  (null, '10000000-0000-0000-0000-000000000001', 'Consultație'),
  (null, '10000000-0000-0000-0000-000000000001', 'Obturație'),
  (null, '10000000-0000-0000-0000-000000000001', 'Tratament endodontic'),
  (null, '10000000-0000-0000-0000-000000000001', 'Albire'),
  -- Parodontale
  (null, '10000000-0000-0000-0000-000000000002', 'Igienizare'),
  (null, '10000000-0000-0000-0000-000000000002', 'Chiuretaj'),
  -- Chirurgicale
  (null, '10000000-0000-0000-0000-000000000003', 'Extracție'),
  (null, '10000000-0000-0000-0000-000000000003', 'Sinus lift'),
  (null, '10000000-0000-0000-0000-000000000003', 'Grefă'),
  (null, '10000000-0000-0000-0000-000000000003', 'Reconstrucție osoasă'),
  -- Protetice
  (null, '10000000-0000-0000-0000-000000000004', 'Fațete'),
  (null, '10000000-0000-0000-0000-000000000004', 'Coroană'),
  (null, '10000000-0000-0000-0000-000000000004', 'Punte'),
  (null, '10000000-0000-0000-0000-000000000004', 'Coroană pe implant'),
  (null, '10000000-0000-0000-0000-000000000004', 'Punte pe implant'),
  (null, '10000000-0000-0000-0000-000000000004', 'All-on-X'),
  (null, '10000000-0000-0000-0000-000000000004', 'Full mouth'),
  (null, '10000000-0000-0000-0000-000000000004', 'Proteză'),
  -- Ortodonție
  (null, '10000000-0000-0000-0000-000000000005', 'Aparat ortodontic');
