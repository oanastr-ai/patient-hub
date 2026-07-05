"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const patientSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  birth_date: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  address: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  family_history: z.string().trim().optional(),
  personal_history: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function toNullable(v: string | undefined) {
  return v && v.length > 0 ? v : null;
}

export async function savePatient(patientId: string | null, formData: FormData) {
  const supabase = await createClient();

  const parsed = patientSchema.parse(Object.fromEntries(formData));
  const values = {
    first_name: parsed.first_name,
    last_name: parsed.last_name,
    birth_date: toNullable(parsed.birth_date),
    phone: toNullable(parsed.phone),
    email: toNullable(parsed.email),
    address: toNullable(parsed.address),
    occupation: toNullable(parsed.occupation),
    family_history: toNullable(parsed.family_history),
    personal_history: toNullable(parsed.personal_history),
    notes: toNullable(parsed.notes),
  };

  let id = patientId;

  if (patientId) {
    const { error } = await supabase
      .from("patients")
      .update(values)
      .eq("id", patientId);
    if (error) throw new Error(error.message);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user!.id)
      .single();

    const { data, error } = await supabase
      .from("patients")
      .insert({ ...values, clinic_id: profile!.clinic_id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  }

  revalidatePath("/patients");
  redirect(`/patients/${id}`);
}
