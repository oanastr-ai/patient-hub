import type { ToothStatus } from "@/components/dental-chart/DentalChart";

/** Normalizează un nume de manoperă: litere mici, fără diacritice. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/**
 * Maparea manoperelor built-in către starea pe care o produc pe dinte.
 * Manoperele fără efect vizibil pe odontogramă (consultație, igienizare,
 * albire, chiuretaj, ortodonție etc.) lipsesc intenționat — nu schimbă starea.
 *
 * Lucrările pe implant trebuie să dea stări de implant, nu de dinte natural:
 * altfel „Coroană pe implant" ar desena un dinte cu rădăcini, fără fixtură.
 */
const PROCEDURE_TOOTH_STATUS: Record<string, ToothStatus> = {
  obturatie: "filling",
  "tratament endodontic": "endo_treated",
  extractie: "missing",
  fatete: "veneer",
  coroana: "crown",
  punte: "bridge_pontic",
  proteza: "denture",
  // fixtura inserată, încă fără lucrare
  implant: "implant",
  // lucrări sprijinite pe implant: fixtură + coroană
  "coroana pe implant": "implant_crown",
  "all-on-x": "implant_crown",
  // la puntea pe implant, dinții selectați formează corpul lucrării; stâlpii pe
  // implant se marchează separat, din dialogul dintelui
  "punte pe implant": "bridge_pontic",
  // reabilitare totală: fiecare dinte selectat primește coroană protetică
  "full mouth": "crown",
};

/** Starea de dinte produsă de o manoperă, sau null dacă nu modifică odontograma. */
export function procedureToToothStatus(nameRo: string): ToothStatus | null {
  return PROCEDURE_TOOTH_STATUS[normalize(nameRo)] ?? null;
}
