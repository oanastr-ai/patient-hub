-- Patient Hub — core schema
-- Faza 0/1: clinici, profiluri, medici, pacienți, manopere, ședințe, odontogramă,
-- lucrări protetice, fișiere pacient, alerte de sănătate, audit log.

create extension if not exists "pgcrypto";

-- =============================================================
-- Helper: updated_at trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- Core
-- =============================================================
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  clinic_id uuid not null references public.clinics (id),
  full_name text not null,
  role text not null default 'owner' check (role in ('owner', 'doctor', 'assistant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medici (inclusiv colaboratori) — date de referință, opțional legate de un login
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  full_name text not null,
  is_collaborator boolean not null default false,
  is_active boolean not null default true,
  profile_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  first_name text not null,
  last_name text not null,
  birth_date date,
  cnp text,
  phone text,
  email text,
  address text,
  occupation text,
  family_history text,   -- antecedente heredo-colaterale
  personal_history text, -- antecedente personale patologice
  notes text,
  gdpr_consent_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index patients_clinic_name_idx on public.patients (clinic_id, last_name, first_name);

-- =============================================================
-- Manopere
-- =============================================================
create table public.procedure_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ro text not null,
  sort_order int not null default 0
);

create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics (id), -- null = built-in
  category_id uuid not null references public.procedure_categories (id),
  name_ro text not null,
  default_price numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Fișa de tratament
-- =============================================================
create table public.treatment_sessions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid references public.doctors (id),
  session_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index treatment_sessions_patient_idx on public.treatment_sessions (patient_id, session_date desc);

create table public.session_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  session_id uuid not null references public.treatment_sessions (id) on delete cascade,
  procedure_id uuid not null references public.procedures (id),
  tooth_codes text[] not null default '{}', -- notație FDI: '11'..'48'; gol = arcada întreagă
  note text,
  created_at timestamptz not null default now()
);
create index session_items_session_idx on public.session_items (session_id);
create index session_items_tooth_gin_idx on public.session_items using gin (tooth_codes);

create table public.tooth_states (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  tooth_code text not null, -- FDI
  status text not null default 'healthy' check (status in (
    'healthy', 'missing', 'implant', 'crown', 'bridge_pontic', 'filling',
    'endo_treated', 'veneer', 'to_extract', 'caries', 'denture'
  )),
  surfaces jsonb, -- rezervat pentru v2 (mezial/distal/ocluzal/...)
  note text,
  updated_from_session_id uuid references public.treatment_sessions (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, tooth_code)
);

create table public.prosthetic_works (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  work_date date not null default current_date,
  plan text,       -- plan terapeutic
  material text,
  color text,      -- culoare
  technician text,
  session_id uuid references public.treatment_sessions (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prosthetic_works_patient_idx on public.prosthetic_works (patient_id, work_date desc);

-- =============================================================
-- Alerte de sănătate (manuale în Faza 1; motorul de reguli vine în Faza 4)
-- =============================================================
create table public.patient_health_alerts (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  rule_id uuid, -- fk către health_alert_rules (Faza 4); null = alertă manuală
  message_ro text not null,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'critical')),
  source_response_id uuid, -- fk către questionnaire_responses (Faza 2)
  acknowledged_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index patient_health_alerts_patient_idx on public.patient_health_alerts (patient_id);

-- =============================================================
-- Fișiere pacient (fotografii, radiografii, documente)
-- =============================================================
create table public.patient_files (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  kind text not null check (kind in ('photo', 'radiograph', 'document')),
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  taken_at date,
  caption text,
  created_at timestamptz not null default now()
);
create index patient_files_patient_kind_idx on public.patient_files (patient_id, kind);

-- =============================================================
-- Audit log
-- =============================================================
create table public.audit_log (
  id bigint generated always as identity primary key,
  clinic_id uuid not null references public.clinics (id),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_clinic_idx on public.audit_log (clinic_id, created_at desc);

-- =============================================================
-- updated_at triggers
-- =============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'clinics', 'profiles', 'doctors', 'patients', 'procedures',
    'treatment_sessions', 'tooth_states', 'prosthetic_works', 'patient_health_alerts'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

-- =============================================================
-- RLS
-- =============================================================
create or replace function public.current_clinic_id()
returns uuid language sql stable security definer set search_path = public as $$
  select clinic_id from public.profiles where id = auth.uid();
$$;

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.procedure_categories enable row level security;
alter table public.procedures enable row level security;
alter table public.treatment_sessions enable row level security;
alter table public.session_items enable row level security;
alter table public.tooth_states enable row level security;
alter table public.prosthetic_works enable row level security;
alter table public.patient_health_alerts enable row level security;
alter table public.patient_files enable row level security;
alter table public.audit_log enable row level security;

create policy "own clinic" on public.clinics
  for all using (id = public.current_clinic_id());

create policy "own profile read" on public.profiles
  for select using (id = auth.uid() or clinic_id = public.current_clinic_id());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid());

create policy "clinic doctors" on public.doctors
  for all using (clinic_id = public.current_clinic_id());

create policy "clinic patients" on public.patients
  for all using (clinic_id = public.current_clinic_id());

create policy "categories readable" on public.procedure_categories
  for select using (auth.role() = 'authenticated');

create policy "procedures read" on public.procedures
  for select using (clinic_id is null or clinic_id = public.current_clinic_id());
create policy "procedures write" on public.procedures
  for insert with check (clinic_id = public.current_clinic_id());
create policy "procedures update" on public.procedures
  for update using (clinic_id = public.current_clinic_id());

create policy "clinic sessions" on public.treatment_sessions
  for all using (clinic_id = public.current_clinic_id());
create policy "clinic session items" on public.session_items
  for all using (clinic_id = public.current_clinic_id());
create policy "clinic tooth states" on public.tooth_states
  for all using (clinic_id = public.current_clinic_id());
create policy "clinic prosthetic works" on public.prosthetic_works
  for all using (clinic_id = public.current_clinic_id());
create policy "clinic health alerts" on public.patient_health_alerts
  for all using (clinic_id = public.current_clinic_id());
create policy "clinic patient files" on public.patient_files
  for all using (clinic_id = public.current_clinic_id());

create policy "clinic audit read" on public.audit_log
  for select using (clinic_id = public.current_clinic_id());
create policy "clinic audit insert" on public.audit_log
  for insert with check (clinic_id = public.current_clinic_id());
