-- Stări noi de dinte și leziune periapicală, după revizuirea odontogramei.
--
-- 'root_remnant'  = rest radicular (coroana lipsește, rădăcina e pe arcadă)
-- 'implant'       = fixtură inserată, încă fără lucrare protetică
-- 'implant_crown' = implant cu coroana montată

alter table public.tooth_states
  drop constraint if exists tooth_states_status_check;

alter table public.tooth_states
  add constraint tooth_states_status_check check (status in (
    'healthy', 'missing', 'to_extract', 'root_remnant',
    'caries', 'filling', 'endo_treated', 'veneer',
    'crown', 'bridge_pontic', 'denture',
    'implant', 'implant_crown'
  ));

-- Rădăcinile cu leziune periapicală, ca indici mezio-distali: [0] sau [0, 2].
-- Un dinte are 1-3 rădăcini, deci lista e mereu scurtă.
alter table public.tooth_states
  add column if not exists periapical jsonb;

comment on column public.tooth_states.periapical is
  'Indicii rădăcinilor cu leziune periapicală, ordonate mezio-distal.';
