import { kioskText, type KioskDict, type Lang } from "@/i18n/kiosk";
import { cn } from "@/lib/utils";
import {
  answerText,
  visibleChildren,
  type Answers,
  type Field,
  type QuestionnaireTemplate,
} from "@/lib/questionnaires";
import { TextBlocks } from "@/components/questionnaire/text-blocks";

export type SignatureImage = { label: string; url: string | null };

/** Chestionarul completat, ca document de citit sau de tipărit. */
export function QuestionnaireDocument({
  template,
  answers,
  signatures,
  signedAt,
  lang = "ro",
}: {
  template: QuestionnaireTemplate;
  answers: Answers;
  signatures: SignatureImage[];
  signedAt: string | null;
  /** Limba în care se afișează documentul (implicit română). */
  lang?: Lang;
}) {
  const t = kioskText(lang).questionnaires;
  const locale = lang === "en" ? "en-GB" : "ro-RO";
  return (
    <article className="space-y-6 rounded-2xl border bg-card p-5 text-[0.95rem] sm:p-8 print:rounded-none print:border-0 print:p-0 print:text-[10.5pt]">
      <h1 className="text-center text-xl font-semibold uppercase tracking-wide text-balance">
        {template.title}
      </h1>

      {template.sections.map((section, i) => (
        <section
          key={i}
          // Secțiunile scurte (întrebări) nu se rup între pagini; textele lungi pot.
          className={cn("space-y-2", !section.text && "break-inside-avoid-page")}
        >
          {section.title && (
            <h2 className="border-b pb-1 font-semibold">{section.title}</h2>
          )}
          {section.text && <TextBlocks blocks={section.text} className="text-justify" />}
          {section.fields && (
            <dl className="space-y-1.5">
              {section.fields.map((f) => (
                <Row key={f.id} field={f} answers={answers} depth={0} t={t} />
              ))}
            </dl>
          )}
          {section.textAfter && (
            <TextBlocks blocks={section.textAfter} className="text-justify" />
          )}
        </section>
      ))}

      <section className="space-y-3">
        <TextBlocks blocks={template.declaration} className="text-justify" />
        <div className="grid items-end gap-6 break-inside-avoid pt-2 sm:auto-cols-fr sm:grid-flow-col">
          <p>
            <span className="font-semibold">{t.date}:</span>{" "}
            {signedAt ? new Date(signedAt).toLocaleDateString(locale) : t.notAnswered}
            {signedAt && template.signedTime && (
              <>
                {" "}
                <span className="font-semibold">{t.time}:</span>{" "}
                {new Date(signedAt).toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </p>
          {signatures.map((s) => (
            <div key={s.label} className="text-center">
              {s.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL semnat, temporar
                <img
                  src={s.url}
                  alt={s.label}
                  className="mx-auto h-24 w-full border-b object-contain"
                />
              ) : (
                <div className="h-24 w-full border-b" />
              )}
              <p className="mt-1 text-sm font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function Row({
  field,
  answers,
  depth,
  t,
}: {
  field: Field;
  answers: Answers;
  depth: number;
  t: KioskDict["questionnaires"];
}) {
  const text = answerText(field, answers);
  const children = visibleChildren(field, answers);
  const itemize = field.kind === "yesno" && field.itemize;
  const shownChildren = itemize
    ? // Din lista lungă de boli se văd doar cele completate.
      (field.followUp ?? []).filter((c) => answerText(c, answers))
    : children;

  return (
    <>
      <div
        className={cn("grid gap-x-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]", depth > 0 && "text-[0.93em]")}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        <dt className={cn(field.kind === "yesno" && depth === 0 && "font-medium")}>
          {field.label}
        </dt>
        <dd
          className={cn(
            "font-semibold whitespace-pre-line",
            !text && "font-normal text-muted-foreground",
            field.kind === "yesno" && text === "da" && "text-primary"
          )}
        >
          {text ? (field.kind === "yesno" ? (text === "da" ? t.yes : t.no) : text) : t.notAnswered}
        </dd>
      </div>
      {shownChildren.map((c) => (
        <Row key={c.id} field={c} answers={answers} depth={depth + 1} t={t} />
      ))}
    </>
  );
}

