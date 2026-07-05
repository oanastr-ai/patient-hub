-- Remindere pentru follow-up / etapa următoare de tratament
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  session_id uuid references public.treatment_sessions (id) on delete set null,
  due_date date not null,
  message_ro text not null,
  notify_patient boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'sent', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reminders_clinic_due_idx on public.reminders (clinic_id, status, due_date);
create index reminders_patient_idx on public.reminders (patient_id);

create trigger reminders_set_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();

alter table public.reminders enable row level security;
create policy "clinic reminders" on public.reminders
  for all using (clinic_id = public.current_clinic_id());
