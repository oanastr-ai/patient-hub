"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/ui/date-field";

export type PatientFormValues = {
  id?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  family_history?: string | null;
  personal_history?: string | null;
  notes?: string | null;
};

export function PatientForm({
  patient,
  action,
}: {
  patient?: PatientFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }

  const fields: Array<{
    name: keyof PatientFormValues;
    label: string;
    type?: string;
    required?: boolean;
  }> = [
    { name: "last_name", label: ro.patients.lastName, required: true },
    { name: "first_name", label: ro.patients.firstName, required: true },
    { name: "birth_date", label: ro.patients.birthDate, type: "date" },
    { name: "phone", label: ro.patients.phone, type: "tel" },
    { name: "email", label: ro.patients.email, type: "email" },
    { name: "address", label: ro.patients.address },
    { name: "occupation", label: ro.patients.occupation },
  ];

  const textareas: Array<{ name: keyof PatientFormValues; label: string }> = [
    { name: "family_history", label: ro.patients.familyHistory },
    { name: "personal_history", label: ro.patients.personalHistory },
    { name: "notes", label: ro.patients.notes },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className="space-y-2">
            <Label htmlFor={f.name}>{f.label}</Label>
            {f.type === "date" ? (
              <DateField
                id={f.name}
                name={f.name}
                defaultValue={(patient?.[f.name] as string) ?? ""}
              />
            ) : (
              <Input
                id={f.name}
                name={f.name}
                type={f.type ?? "text"}
                required={f.required}
                defaultValue={(patient?.[f.name] as string) ?? ""}
              />
            )}
          </div>
        ))}
      </div>
      {textareas.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label htmlFor={f.name}>{f.label}</Label>
          <textarea
            id={f.name}
            name={f.name}
            rows={3}
            defaultValue={(patient?.[f.name] as string) ?? ""}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? ro.common.loading : ro.patients.save}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {ro.patients.cancel}
        </Button>
      </div>
    </form>
  );
}
