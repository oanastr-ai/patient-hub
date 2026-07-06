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
 */
const PROCEDURE_TOOTH_STATUS: Record<string, ToothStatus> = {
  obturatie: "filling",
  "tratament endodontic": "endo_treated",
  extractie: "missing",
  fatete: "veneer",
  coroana: "crown",
  punte: "bridge_pontic",
  "coroana pe implant": "crown",
  "punte pe implant": "bridge_pontic",
  "all-on-x": "implant",
  proteza: "denture",
};

/** Starea de dinte produsă de o manoperă, sau null dacă nu modifică odontograma. */
export function procedureToToothStatus(nameRo: string): ToothStatus | null {
  return PROCEDURE_TOOTH_STATUS[normalize(nameRo)] ?? null;
}
