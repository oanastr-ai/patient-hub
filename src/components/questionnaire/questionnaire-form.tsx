"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePad } from "@/components/questionnaire/signature-pad";
import { TextBlocks } from "@/components/questionnaire/text-blocks";
import {
  OTHER_OPTION,
  detailKey,
  missingAnswers,
  visibleChildren,
  type Answers,
  type Field,
  type Option,
  type QuestionnaireTemplate,
} from "@/lib/questionnaires";

const t = ro.questionnaires;

type Ctx = {
  answers: Answers;
  set: (key: string, value: string | string[] | undefined) => void;
  missing: Set<string>;
};

type SignatureRole = "patient" | "doctor";

export function QuestionnaireForm({
  template,
  initialAnswers,
  onSubmit,
}: {
  template: QuestionnaireTemplate;
  initialAnswers: Answers;
  onSubmit: (answers: Answers, signatures: { patient: string; doctor?: string }) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [signatures, setSignatures] = useState<Partial<Record<SignatureRole, string>>>({});
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [unsigned, setUnsigned] = useState<SignatureRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const roles: SignatureRole[] = template.doctorSignature ? ["patient", "doctor"] : ["patient"];

  function set(key: string, value: string | string[] | undefined) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
    setMissing((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  function sign(role: SignatureRole, dataUrl: string | null) {
    setSignatures((prev) => ({ ...prev, [role]: dataUrl ?? undefined }));
    if (dataUrl) setUnsigned((prev) => prev.filter((r) => r !== role));
  }

  function submit() {
    const stillMissing = missingAnswers(template, answers);
    const stillUnsigned = roles.filter((r) => !signatures[r]);
    setMissing(new Set(stillMissing));
    setUnsigned(stillUnsigned);
    const firstId =
      stillMissing[0] ?? (stillUnsigned[0] ? `signature-${stillUnsigned[0]}` : null);
    if (firstId) {
      document
        .getElementById(`q-${firstId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(answers, { patient: signatures.patient!, doctor: signatures.doctor });
      } catch {
        setError(ro.common.error);
      }
    });
  }

  const ctx: Ctx = { answers, set, missing };
  const today = new Date().toLocaleDateString("ro-RO");
  const hasMissing = missing.size > 0 || unsigned.length > 0;

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-center text-2xl font-semibold text-balance sm:text-3xl">
        {template.title}
      </h1>

      {template.sections.map((section, i) => (
        <section key={i} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
          {section.title && <h2 className="text-xl font-semibold">{section.title}</h2>}
          {section.text && <TextBlocks blocks={section.text} className="text-base" />}
          {section.fields?.map((f) => (
            <FieldView key={f.id} field={f} ctx={ctx} />
          ))}
          {section.textAfter && <TextBlocks blocks={section.textAfter} className="text-base" />}
        </section>
      ))}

      <section className="space-y-4 rounded-2xl border bg-card p-5 sm:p-7">
        {template.declaration.map((p, i) => (
          <p key={i} className="text-base leading-relaxed">
            {p}
          </p>
        ))}
        <p className="text-sm text-muted-foreground">
          {t.date}: {today}
        </p>
        {roles.map((role) => (
          <div
            key={role}
            id={`q-signature-${role}`}
            className={cn(
              "scroll-mt-24 space-y-2 rounded-xl",
              unsigned.includes(role) && "-m-2 p-2 ring-2 ring-destructive/40"
            )}
          >
            <h2 className="text-lg font-semibold">
              {role === "patient" ? template.signatureLabel : t.doctorSignature}
            </h2>
            <SignaturePad
              placeholder={role === "patient" ? t.signatureHint : t.doctorSignatureHint}
              clearLabel={t.clearSignature}
              onChange={(s) => sign(role, s)}
            />
            {unsigned.includes(role) && (
              <p className="text-sm text-destructive">{t.signatureMissing}</p>
            )}
          </div>
        ))}
      </section>

      {hasMissing && (
        <p className="text-center text-destructive" role="alert">
          {t.missing}
        </p>
      )}
      {error && (
        <p className="text-center text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        className="h-14 w-full text-lg"
        disabled={pending}
        onClick={submit}
      >
        {pending ? t.submitting : t.submit}
      </Button>
    </div>
  );
}

function FieldView({ field, ctx }: { field: Field; ctx: Ctx }) {
  const isMissing = ctx.missing.has(field.id);
  const children = visibleChildren(field, ctx.answers);

  return (
    <div
      id={`q-${field.id}`}
      className={cn(
        "scroll-mt-24 space-y-3 rounded-xl",
        isMissing && "-m-2 p-2 ring-2 ring-destructive/40"
      )}
    >
      {field.kind === "yesno" && <YesNo field={field} ctx={ctx} />}
      {field.kind === "text" && <TextField field={field} ctx={ctx} />}
      {field.kind === "choice" && <Choice field={field} ctx={ctx} />}
      {field.kind === "checks" && <Checks field={field} ctx={ctx} />}

      {isMissing && <p className="text-sm text-destructive">{t.missingOne}</p>}

      {children.length > 0 && (
        <div className="space-y-5 border-l-4 border-primary/25 pl-4 sm:pl-5">
          {children.map((c) => (
            <FieldView key={c.id} field={c} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}

function Question({ field }: { field: Field }) {
  const optional =
    (field.kind === "yesno" && field.optional) ||
    (field.kind === "text" && !field.required) ||
    (field.kind === "choice" && !field.required);
  return (
    <div className="space-y-0.5">
      <p className={cn("text-base leading-snug", field.kind === "yesno" && "font-semibold")}>
        {field.label}
        {optional && field.kind === "yesno" && (
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">({t.optional})</span>
        )}
      </p>
      {field.note && <p className="text-sm text-muted-foreground">{field.note}</p>}
    </div>
  );
}

function YesNo({ field, ctx }: { field: Field & { kind: "yesno" }; ctx: Ctx }) {
  const value = ctx.answers[field.id];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Question field={field} />
      <div className="flex shrink-0 gap-2">
        {(["da", "nu"] as const).map((v) => (
          <ToggleButton
            key={v}
            selected={value === v}
            // O a doua atingere pe opțiunea aleasă o deselectează (util la cele opționale).
            onClick={() => ctx.set(field.id, value === v ? undefined : v)}
            className="w-24"
          >
            {v === "da" ? t.yes : t.no}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}

function TextField({ field, ctx }: { field: Field & { kind: "text" }; ctx: Ctx }) {
  const value = (ctx.answers[field.id] as string | undefined) ?? "";
  const id = `input-${field.id}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block">
        <Question field={field} />
      </label>
      {field.multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => ctx.set(field.id, e.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => ctx.set(field.id, e.target.value)}
          className={cn("h-12 text-base", field.short && "max-w-56")}
        />
      )}
    </div>
  );
}

function Choice({ field, ctx }: { field: Field & { kind: "choice" }; ctx: Ctx }) {
  const value = ctx.answers[field.id];
  return (
    <div className="space-y-2">
      <Question field={field} />
      <div className="flex flex-wrap gap-2">
        {field.options.map((o) => (
          <ToggleButton
            key={o.id}
            selected={value === o.id}
            onClick={() => ctx.set(field.id, o.id)}
          >
            {o.label}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}

function Checks({ field, ctx }: { field: Field & { kind: "checks" }; ctx: Ctx }) {
  const checked = (ctx.answers[field.id] as string[] | undefined) ?? [];
  const options: Option[] = field.other
    ? [...field.options, { id: OTHER_OPTION, label: field.other, detail: t.other }]
    : field.options;

  function toggle(optId: string) {
    const next = checked.includes(optId)
      ? checked.filter((x) => x !== optId)
      : [...checked, optId];
    ctx.set(field.id, next.length ? next : undefined);
  }

  const withDetail = options.filter((o) => o.detail && checked.includes(o.id));

  return (
    <div className="space-y-2">
      <Question field={field} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <ToggleButton
            key={o.id}
            selected={checked.includes(o.id)}
            onClick={() => toggle(o.id)}
            check
          >
            {o.label}
          </ToggleButton>
        ))}
      </div>
      {withDetail.map((o) => {
        const key = detailKey(field.id, o.id);
        return (
          <div key={o.id} className="space-y-1 pl-1">
            <label htmlFor={`input-${key}`} className="text-sm text-muted-foreground">
              {o.label} — {o.detail}
            </label>
            <Input
              id={`input-${key}`}
              value={(ctx.answers[key] as string | undefined) ?? ""}
              onChange={(e) => ctx.set(key, e.target.value)}
              className="h-11 text-base"
            />
          </div>
        );
      })}
    </div>
  );
}

function ToggleButton({
  selected,
  onClick,
  children,
  className,
  check,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  check?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-base font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:border-primary/50",
        className
      )}
    >
      {check && (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded border-2",
            selected ? "border-primary-foreground" : "border-muted-foreground/50"
          )}
        >
          {selected && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      )}
      {children}
    </button>
  );
}
