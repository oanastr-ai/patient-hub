# Patient Hub

Aplicație de management pentru Cabinet Stomatologic Dr. Oana Vlad — PWA responsivă (desktop, tabletă, telefon).

## Stack

- **Next.js 16** (App Router, TypeScript) — deploy pe Vercel
- **Tailwind CSS 4 + shadcn/ui** (Base UI)
- **Supabase** (Postgres + Auth + Storage, regiune EU) — schema în `supabase/migrations/`
- **Serwist** — PWA / service worker

## Setup local

1. `npm install`
2. Copiază `.env.example` în `.env.local` și completează cheile Supabase
3. Rulează migrările din `supabase/migrations/` + `supabase/seed.sql` în proiectul Supabase
4. `npm run dev`

## Structură

- `src/app/(auth)/login` — autentificare
- `src/app/(app)/patients` — listă pacienți, fișă pacient cu secțiunile: Chestionare, Plan de tratament, Fișa de tratament, Fotografii, Radiografii
- `src/i18n/ro.ts` — toate textele UI (română)
- `supabase/` — migrări SQL + seed (categorii și manopere)

## Roadmap

Faza 0 (fundație) → Faza 1 (fișa de tratament digitală + odontogramă + fișiere) → Faza 2 (chestionare + semnare pe tabletă) → Faza 3 (plan de tratament + trimitere email/WhatsApp) → Faza 4 (alerte automate de sănătate + Google Calendar + remindere) → Faza 5 (WhatsApp Business API + GDPR hardening).
