import type { Answers, Field, Option, QuestionnaireTemplate, Section, TextBlock } from "./types";

/**
 * Traducerea unui chestionar: textele românești → textele traduse.
 *
 * Varianta tradusă se construiește din șablonul românesc, deci are exact
 * aceleași întrebări, id-uri și reguli; se schimbă doar textele. Așa,
 * răspunsurile date în engleză se citesc și în română (rezumatul medicului),
 * iar o întrebare adăugată în română nu poate lipsi din traducere — cel mult
 * apare netradusă (vezi `untranslated`).
 */
export type Translation = {
  /** Text românesc exact → text tradus. */
  strings: Record<string, string>;
  /** Valori precompletate proprii limbii, peste cele românești (ex. „dentist"). */
  prefillValues?: Answers;
};

type Tr = (s: string) => string;

function blocks(list: TextBlock[] | undefined, tr: Tr): TextBlock[] | undefined {
  return list?.map((b) =>
    typeof b === "string"
      ? tr(b)
      : "list" in b
        ? { list: b.list.map(tr) }
        : { heading: tr(b.heading) }
  );
}

function option(o: Option, tr: Tr): Option {
  return {
    ...o,
    label: tr(o.label),
    detail: o.detail && tr(o.detail),
    followUp: o.followUp?.map((f) => field(f, tr)),
  };
}

function field(f: Field, tr: Tr): Field {
  const base = { label: tr(f.label), note: f.note && tr(f.note) };
  switch (f.kind) {
    case "yesno":
      return { ...f, ...base, followUp: f.followUp?.map((c) => field(c, tr)) };
    case "text":
      return { ...f, ...base };
    case "choice":
      return { ...f, ...base, options: f.options.map((o) => option(o, tr)) };
    case "checks":
      return {
        ...f,
        ...base,
        options: f.options.map((o) => option(o, tr)),
        other: f.other && tr(f.other),
      };
  }
}

function section(s: Section, tr: Tr): Section {
  return {
    title: s.title && tr(s.title),
    text: blocks(s.text, tr),
    fields: s.fields?.map((f) => field(f, tr)),
    textAfter: blocks(s.textAfter, tr),
  };
}

function walk(template: QuestionnaireTemplate, tr: Tr): QuestionnaireTemplate {
  return {
    ...template,
    title: tr(template.title),
    shortTitle: tr(template.shortTitle),
    sections: template.sections.map((s) => section(s, tr)),
    declaration: template.declaration.map(tr),
    signatureLabel: tr(template.signatureLabel),
  };
}

export function translate(template: QuestionnaireTemplate, t: Translation): QuestionnaireTemplate {
  const translated = walk(template, (s) => t.strings[s] ?? s);
  const { prefill } = template;
  const values = t.prefillValues;
  if (!prefill || !values) return translated;
  return { ...translated, prefill: (ctx) => ({ ...prefill(ctx), ...values }) };
}

/** Textele din șablon care nu au traducere (pentru verificare). */
export function untranslated(template: QuestionnaireTemplate, t: Translation): string[] {
  const missing = new Set<string>();
  walk(template, (s) => {
    if (!(s in t.strings)) missing.add(s);
    return s;
  });
  return [...missing];
}
