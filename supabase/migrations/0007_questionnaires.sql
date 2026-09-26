-- Faza 2: chestionare completate de pacient pe tabletă, cu semnătură.
--
-- Textele chestionarelor stau în cod (src/lib/questionnaires), versionate;
-- aici se păstrează doar răspunsurile, plus codul și versiunea șablonului,
-- ca un răspuns vechi să poată fi afișat corect și după ce textul se schimbă.

create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  template_code text not null,
  template_version int not null,
  answers jsonb not null default '{}'::jsonb,
  signature_path text, -- PNG în bucket-ul patient-files
  signed_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists questionnaire_responses_patient_idx
  on public.questionnaire_responses (patient_id, created_at desc);

alter table public.questionnaire_responses enable row level security;

drop policy if exists "clinic questionnaire responses" on public.questionnaire_responses;
create policy "clinic questionnaire responses" on public.questionnaire_responses
  for all using (clinic_id = public.current_clinic_id());

-- Legătura anunțată în 0001 pentru alertele generate din chestionar.
alter table public.patient_health_alerts
  drop constraint if exists patient_health_alerts_source_response_fk;
alter table public.patient_health_alerts
  add constraint patient_health_alerts_source_response_fk
  foreign key (source_response_id)
  references public.questionnaire_responses (id) on delete set null;
