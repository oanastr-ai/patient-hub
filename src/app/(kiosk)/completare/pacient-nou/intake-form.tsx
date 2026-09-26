"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import { birthDateFromCnp, isValidCnp } from "@/lib/cnp";
import { INTAKE_FLOW } from "@/lib/questionnaires";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createIntakePatient, type IntakeInput } from "./actions";

const t = ro.intake;

const FIELDS: {
  key: keyof IntakeInput;
  label: string;
  type?: string;
  required?: boolean;
  short?: boolean;
  placeholder?: string;
}[] = [
  { key: "last_name", label: t.lastName, required: true },
  { key: "first_name", label: t.firstName, required: true },
  { key: "cnp", label: t.cnp, short: true },
  { key: "birth_date", label: t.birthDate, type: "date", short: true },
  { key: "id_card", label: t.idCard, short: true, placeholder: t.idCardExample },
  { key: "phone", label: t.phone, type: "tel", short: true },
  { key: "email", label: t.email, type: "email" },
  { key: "address", label: t.address },
  { key: "occupation", label: t.occupation },
];

const EMPTY: IntakeInput = {
  last_name: "",
  first_name: "",
  cnp: "",
  birth_date: "",
  id_card: "",
  phone: "",
  email: "",
  address: "",
  occupation: "",
};

export function IntakeForm() {
  const router = useRouter();
  const [values, setValues] = useState<IntakeInput>(EMPTY);
  // Pacientul a scris singur data nașterii — CNP-ul nu o mai suprascrie.
  const [birthDateTyped, setBirthDateTyped] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeInput, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set(key: keyof IntakeInput, value: string) {
    if (key === "birth_date") setBirthDateTyped(value !== "");
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Data nașterii urmează CNP-ul la fiecare corectură (nu doar la primul
      // CNP valid), cât timp pacientul nu a scris-o singur.
      if (key === "cnp" && !birthDateTyped) {
        next.birth_date = birthDateFromCnp(value.trim()) ?? "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit() {
    const found: typeof errors = {};
    if (!values.last_name.trim()) found.last_name = t.required;
    if (!values.first_name.trim()) found.first_name = t.required;
    if (values.cnp.trim() && !isValidCnp(values.cnp.trim())) found.cnp = t.cnpInvalid;
    setErrors(found);
    const first = FIELDS.find((f) => found[f.key]);
    if (first) {
      document.getElementById(`intake-${first.key}`)?.focus();
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await createIntakePatient(values);
        router.push(`/completare/${id}/${INTAKE_FLOW[0]}?flux=nou`);
      } catch {
        setError(ro.common.error);
      }
    });
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.title}</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">{t.intro}</p>
      </header>

      <section className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-7">
        {FIELDS.map((f) => (
          <div key={f.key} className={cn("space-y-1.5", !f.short && "sm:col-span-2")}>
            <label htmlFor={`intake-${f.key}`} className="block text-base">
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </label>
            <Input
              id={`intake-${f.key}`}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              inputMode={f.key === "cnp" ? "numeric" : undefined}
              autoComplete="off"
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!errors[f.key]}
              className="h-12 text-base"
            />
            {errors[f.key] && <p className="text-sm text-destructive">{errors[f.key]}</p>}
          </div>
        ))}
      </section>

      {error && (
        <p className="text-center text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="button" className="h-14 w-full text-lg" disabled={pending} onClick={submit}>
        {pending ? t.saving : t.continue}
      </Button>
    </div>
  );
}
