import { ro } from "./ro";

/**
 * Textele văzute de pacient pe tabletă, în limbile în care se pot completa
 * chestionarele. Restul aplicației (partea medicului) rămâne în română.
 */
export type Lang = "ro" | "en";

export const LANGS: Lang[] = ["ro", "en"];

/** Parametrii din adresă pentru ecranele pacientului (flux + limbă). */
export function kioskQuery(intake: boolean, lang: Lang) {
  const params = new URLSearchParams();
  if (intake) params.set("flux", "nou");
  if (lang !== "ro") params.set("lang", lang);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function parseLang(value: string | undefined | null): Lang {
  return value === "en" ? "en" : "ro";
}

type Strings<T> = { [K in keyof T]: string };

export type KioskDict = {
  questionnaires: Strings<typeof ro.questionnaires>;
  intake: Strings<typeof ro.intake>;
  error: string;
};

const en: KioskDict = {
  questionnaires: {
    fillOnTablet: "Fill in",
    fillInEnglish: "English",
    fillInEnglishHint: "English version, for foreign patients",
    signedInEnglish: "in English",
    showSigned: "Show signed version (English)",
    showRomanian: "Show in Romanian",
    completed: "Completed questionnaires",
    empty: "No questionnaires completed yet.",
    signedAt: "Signed",
    open: "Open",
    patient: "Patient",
    yes: "Yes",
    no: "No",
    other: "Please specify",
    optional: "optional",
    missing: "Please answer the highlighted questions.",
    missingOne: "Please answer this question.",
    doctorSignature: "Doctor",
    doctorSignatureHint: "Doctor's signature",
    signatureHint: "Sign here with your finger",
    signatureMissing: "Please sign.",
    clearSignature: "Clear signature",
    date: "Date",
    time: "Time",
    submit: "Sign and submit",
    submitting: "Submitting...",
    thanksTitle: "Thank you!",
    thanksBody: "The document has been signed and saved.",
    backToPatient: "Back to patient",
    exitKiosk: "Exit patient mode",
    findings: "Key findings",
    noFindings: "No positive answers.",
    print: "Print / PDF",
    deleteConfirm: "Delete this signed questionnaire? This cannot be undone.",
    notAnswered: "—",
  },
  intake: {
    start: "New patient",
    startAll: "All first-visit questionnaires",
    title: "Welcome!",
    intro: "Please fill in your details. You will only write them once — they will then appear automatically in the following documents.",
    lastName: "Last name",
    firstName: "First name",
    cnp: "Romanian personal numeric code (CNP), if you have one",
    cnpInvalid: "This CNP does not look right. Please check it.",
    birthDate: "Date of birth",
    idCard: "ID card / passport — series and number",
    idCardExample: "e.g. CJ 123456",
    phone: "Phone",
    email: "E-mail",
    address: "Address (home)",
    occupation: "Occupation / workplace",
    required: "Required field.",
    continue: "Continue",
    saving: "Saving...",
    nextTitle: "Thank you!",
    nextBody: "Next document:",
    step: "Document",
    of: "of",
  },
  error: "Something went wrong. Please try again.",
};

const dicts: Record<Lang, KioskDict> = {
  ro: { questionnaires: ro.questionnaires, intake: ro.intake, error: ro.common.error },
  en,
};

export function kioskText(lang: Lang): KioskDict {
  return dicts[lang];
}
