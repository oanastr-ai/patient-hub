import { acordPacient } from "./acord-pacient";
import { consimtamant } from "./consimtamant";
import { gdpr } from "./gdpr";
import { stareGenerala } from "./stare-generala";
import {
  OTHER_OPTION,
  detailKey,
  type Answers,
  type Field,
  type QuestionnaireTemplate,
} from "./types";

export * from "./types";

/** Toate versiunile tuturor chestionarelor; ultima versiune a unui cod e cea curentă. */
const TEMPLATES: QuestionnaireTemplate[] = [stareGenerala, consimtamant, acordPacient, gdpr];

export const CURRENT_TEMPLATES = TEMPLATES.filter(
  (t) => !TEMPLATES.some((o) => o.code === t.code && o.version > t.version)
);

export function getTemplate(code: string, version?: number) {
  const matching = TEMPLATES.filter((t) => t.code === code);
  if (version !== undefined) return matching.find((t) => t.version === version);
  return matching.sort((a, b) => b.version - a.version)[0];
}

/** Câmpurile copil vizibile pentru răspunsurile date. */
export function visibleChildren(field: Field, answers: Answers): Field[] {
  if (field.kind === "yesno") return answers[field.id] === "da" ? field.followUp ?? [] : [];
  if (field.kind === "choice") {
    const chosen = field.options.find((o) => o.id === answers[field.id]);
    return chosen?.followUp ?? [];
  }
  return [];
}

function walk(fields: Field[], answers: Answers, visit: (f: Field) => void) {
  for (const f of fields) {
    visit(f);
    walk(visibleChildren(f, answers), answers, visit);
  }
}

/** Întrebările obligatorii vizibile rămase fără răspuns (id-uri). */
export function missingAnswers(template: QuestionnaireTemplate, answers: Answers): string[] {
  const missing: string[] = [];
  for (const section of template.sections) {
    walk(section.fields ?? [], answers, (f) => {
      const required =
        (f.kind === "yesno" && !f.optional) ||
        ((f.kind === "text" || f.kind === "choice") && f.required);
      const value = answers[f.id];
      const empty = value === undefined || (typeof value === "string" && value.trim() === "");
      if (required && empty) missing.push(f.id);
    });
  }
  return missing;
}

/**
 * Păstrează doar răspunsurile câmpurilor vizibile: dacă pacientul a bifat
 * ceva sub „da" și apoi a trecut pe „nu", detaliile ascunse nu se salvează.
 */
export function pruneAnswers(template: QuestionnaireTemplate, answers: Answers): Answers {
  const out: Answers = {};
  const keep = (key: string) => {
    const v = answers[key];
    if (v === undefined) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    out[key] = typeof v === "string" ? v.trim() : v;
  };
  for (const section of template.sections) {
    walk(section.fields ?? [], answers, (f) => {
      keep(f.id);
      if (f.kind === "checks") {
        const checked = (answers[f.id] as string[] | undefined) ?? [];
        for (const optId of checked) keep(detailKey(f.id, optId));
      }
    });
  }
  return out;
}

export type SummaryLine = { label: string; value: string; alert: boolean };

function optionText(field: Field & { kind: "checks" }, answers: Answers, optId: string) {
  const label =
    optId === OTHER_OPTION
      ? field.other ?? "altele"
      : field.options.find((o) => o.id === optId)?.label ?? optId;
  const detail = answers[detailKey(field.id, optId)];
  return detail ? `${label} (${detail})` : label;
}

/** Textul unui răspuns, așa cum apare în rezumat și în document. */
export function answerText(field: Field, answers: Answers): string {
  const v = answers[field.id];
  if (v === undefined) return "";
  switch (field.kind) {
    case "yesno":
    case "text":
      return String(v);
    case "choice":
      return field.options.find((o) => o.id === v)?.label ?? String(v);
    case "checks":
      return (v as string[]).map((id) => optionText(field, answers, id)).join(", ");
  }
}

/**
 * Răspunsurile pozitive — ce trebuie să vadă medicul înainte de tratament:
 * fiecare „da" cu detaliile lui. Datele declarantului și sursa de
 * recomandare nu intră aici.
 */
export function positiveFindings(template: QuestionnaireTemplate, answers: Answers): SummaryLine[] {
  const lines: SummaryLine[] = [];
  const visit = (fields: Field[]) => {
    for (const f of fields) {
      // Un câmp text important completat (ex. alergiile din consimțământ).
      if (f.kind === "text" && f.alert && answers[f.id]) {
        lines.push({ label: f.summaryLabel ?? f.label, value: answerText(f, answers), alert: true });
        continue;
      }
      if (f.kind !== "yesno" || answers[f.id] !== "da") continue;
      const children = f.followUp ?? [];
      const leaves = children.filter((c) => c.kind !== "yesno");
      if (f.itemize) {
        for (const c of leaves) {
          const t = answerText(c, answers);
          if (t) lines.push({ label: c.label, value: t, alert: !!c.alert });
        }
      } else {
        const details = leaves
          .map((c) => {
            const t = answerText(c, answers);
            return t ? `${c.label}: ${t}` : "";
          })
          .filter(Boolean);
        lines.push({ label: f.label, value: details.join(" · ") || "da", alert: !!f.alert });
      }
      visit(children);
    }
  };
  for (const section of template.sections) visit(section.fields ?? []);
  return lines;
}

/**
 * Chestionarele de la prima consultație, în ordinea în care le completează
 * pacientul pe tabletă. Acordul pacientului lipsește intenționat: se dă
 * pentru un act medical anume, după examinare.
 */
export const INTAKE_FLOW = ["stare-generala", "consimtamant", "gdpr"];

/** Următorul chestionar din fluxul de primă consultație, dacă există. */
export function nextInIntake(code: string): QuestionnaireTemplate | undefined {
  const i = INTAKE_FLOW.indexOf(code);
  return i >= 0 && i < INTAKE_FLOW.length - 1 ? getTemplate(INTAKE_FLOW[i + 1]) : undefined;
}
