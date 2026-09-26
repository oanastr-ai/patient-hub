-- Consimțământul informat se semnează și de medic, pe aceeași tabletă.
alter table public.questionnaire_responses
  add column if not exists doctor_signature_path text; -- PNG în bucket-ul patient-files
