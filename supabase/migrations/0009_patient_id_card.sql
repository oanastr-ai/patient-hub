-- Actul de identitate al pacientului (B.I./C.I.), scris o singură dată pe
-- tabletă și precompletat de aici în chestionare.
alter table public.patients
  add column if not exists id_card_series text,
  add column if not exists id_card_number text;
