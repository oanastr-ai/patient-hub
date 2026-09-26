"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClinicId } from "@/lib/clinic";
import { birthDateFromCnp, isValidCnp } from "@/lib/cnp";

const intakeSchema = z.object({
  last_name: z.string().trim().min(1),
  first_name: z.string().trim().min(1),
  cnp: z.string().trim(),
  birth_date: z.string().trim(),
  id_card_series: z.string().trim(),
  id_card_number: z.string().trim(),
  phone: z.string().trim(),
  email: z.string().trim(),
  address: z.string().trim(),
  occupation: z.string().trim(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

/**
 * Creează fișa unui pacient nou din datele scrise de el pe tabletă.
 * Dacă un pacient cu același CNP există deja, se actualizează fișa lui în
 * loc să apară un duplicat (pacient care revine, dar nu a fost găsit).
 */
export async function createIntakePatient(input: IntakeInput): Promise<{ id: string }> {
  const data = intakeSchema.parse(input);
  if (data.cnp && !isValidCnp(data.cnp)) throw new Error("CNP invalid");

  const orNull = (v: string) => (v ? v : null);
  const values = {
    last_name: data.last_name,
    first_name: data.first_name,
    cnp: orNull(data.cnp),
    birth_date: orNull(data.birth_date) ?? (data.cnp ? birthDateFromCnp(data.cnp) : null),
    id_card_series: orNull(data.id_card_series.toUpperCase()),
    id_card_number: orNull(data.id_card_number),
    phone: orNull(data.phone),
    email: orNull(data.email),
    address: orNull(data.address),
    occupation: orNull(data.occupation),
  };

  const supabase = await createClient();

  if (values.cnp) {
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("cnp", values.cnp)
      .is("archived_at", null)
      .limit(1)
      .maybeSingle();
    if (existing) {
      // Păstrează ce era în fișă acolo unde pacientul a lăsat câmpul gol.
      const update = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== null));
      const { error } = await supabase.from("patients").update(update).eq("id", existing.id);
      if (error) throw new Error(error.message);
      revalidatePath("/patients");
      return { id: existing.id };
    }
  }

  const clinicId = await getClinicId();
  const { data: row, error } = await supabase
    .from("patients")
    .insert({ ...values, clinic_id: clinicId })
    .select("id")
    .single();
  if (error || !row) throw new Error(error?.message ?? "Eroare la salvare");

  revalidatePath("/patients");
  return { id: row.id };
}
