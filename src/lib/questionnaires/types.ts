/**
 * Descrierea declarativă a unui chestionar. Același șablon alimentează
 * formularul completat de pacient, documentul tipărit și rezumatul medicului.
 *
 * Răspunsurile sunt un obiect plat, indexat după `id`:
 * - `yesno`  → "da" | "nu"
 * - `text`   → string
 * - `choice` → id-ul opțiunii alese
 * - `checks` → lista id-urilor bifate; textul unei opțiuni cu `detail`
 *              stă la cheia `${fieldId}.${optionId}` (vezi `detailKey`).
 */

export type Option = {
  id: string;
  label: string;
  /** Dacă e setat, opțiunea bifată cere o precizare (eticheta câmpului). */
  detail?: string;
  /** Câmpuri afișate doar când opțiunea e aleasă (pentru `choice`). */
  followUp?: Field[];
};

type FieldBase = {
  id: string;
  label: string;
  /** Explicație mică sub întrebare (ex. nota de subsol din formularul tipărit). */
  note?: string;
  /** Eticheta scurtă din rezumatul medicului, când întrebarea e lungă. */
  summaryLabel?: string;
  /** Întrebare importantă clinic — evidențiată în rezumatul medicului. */
  alert?: boolean;
};

export type Field =
  | (FieldBase & {
      kind: "yesno";
      /** Pacientul poate sări peste întrebare (ex. sarcina, la bărbați). */
      optional?: boolean;
      /** Câmpuri afișate doar la răspunsul „da". */
      followUp?: Field[];
      /**
       * În rezumatul medicului, fiecare câmp copil completat apare pe rândul
       * lui, nu ca detaliu al întrebării (ex. lista de boli).
       */
      itemize?: boolean;
    })
  | (FieldBase & {
      kind: "text";
      multiline?: boolean;
      required?: boolean;
      short?: boolean;
    })
  | (FieldBase & {
      kind: "choice";
      options: Option[];
      required?: boolean;
    })
  | (FieldBase & {
      kind: "checks";
      options: Option[];
      /** Adaugă opțiunea „altele" cu câmp de precizare. */
      other?: string;
    });

/** Un paragraf de citit, un subtitlu sau o listă cu puncte, în interiorul unei secțiuni. */
export type TextBlock = string | { heading: string } | { list: string[] };

export type Section = {
  title?: string;
  /** Text informativ, afișat înaintea câmpurilor. */
  text?: TextBlock[];
  fields?: Field[];
  /** Text informativ, afișat după câmpuri. */
  textAfter?: TextBlock[];
};

/** Ce se știe deja despre pacient, pentru precompletare. */
export type PrefillContext = {
  patientName: string;
  address: string | null;
  cnp: string | null;
  phone: string | null;
  email: string | null;
  /** Ultimele răspunsuri ale pacientului, pe codul chestionarului. */
  latest: Record<string, Answers>;
};

export type QuestionnaireTemplate = {
  code: string;
  version: number;
  title: string;
  /** Titlul scurt, pentru liste. */
  shortTitle: string;
  sections: Section[];
  /** Textul declarației de deasupra semnăturii. */
  declaration: string[];
  /** Eticheta semnăturii pacientului / declarantului. */
  signatureLabel: string;
  /**
   * Fără caseta „De reținut" (ex. acordul pacientului, unde „da" înseamnă
   * doar că informația a fost dată, nu o problemă de sănătate).
   */
  summary?: boolean;
  /** Pe document apare și ora semnării, nu doar data. */
  signedTime?: boolean;
  /** La semnare se completează data acordului GDPR în fișa pacientului. */
  recordsGdprConsent?: boolean;
  /** Documentul se semnează și de medic, pe aceeași tabletă. */
  doctorSignature?: boolean;
  /** Răspunsurile precompletate din datele pacientului. */
  prefill?: (ctx: PrefillContext) => Answers;
};

export type Answers = Record<string, string | string[]>;

export const OTHER_OPTION = "altele";

export function detailKey(fieldId: string, optionId: string) {
  return `${fieldId}.${optionId}`;
}
