-- Limba în care pacientul a completat și semnat chestionarul (ro / en).
alter table public.questionnaire_responses
  add column if not exists language text not null default 'ro';

alter table public.questionnaire_responses
  drop constraint if exists questionnaire_responses_language_check;
alter table public.questionnaire_responses
  add constraint questionnaire_responses_language_check check (language in ('ro', 'en'));
