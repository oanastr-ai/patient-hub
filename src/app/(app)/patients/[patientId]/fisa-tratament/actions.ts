"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClinicId } from "@/lib/clinic";

const TOOTH_CODE = /^[1-4][1-8]$/;

function fisaPath(patientId: string) {
  return `/patients/${patientId}/fisa-tratament`;
}

// ---------------- Ședințe ----------------

const sessionSchema = z.object({
  session_date: z.string().min(1),
  doctor_id: z.string().uuid().nullable(),
  notes: z.string().nullable(),
  items: z
    .array(
      z.object({
        procedure_id: z.string().uuid(),
        tooth_codes: z.array(z.string().regex(TOOTH_CODE)),
        note: z.string().nullable(),
      })
    )
    .min(1),
});

export async function addSession(
  patientId: string,
  input: z.infer<typeof sessionSchema>
) {
  const parsed = sessionSchema.parse(input);
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { data: session, error } = await supabase
    .from("treatment_sessions")
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      doctor_id: parsed.doctor_id,
      session_date: parsed.session_date,
      notes: parsed.notes,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase.from("session_items").insert(
    parsed.items.map((item) => ({
      clinic_id: clinicId,
      session_id: session.id,
      procedure_id: item.procedure_id,
      tooth_codes: item.tooth_codes,
      note: item.note,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath(fisaPath(patientId));
}

export async function updateSession(
  patientId: string,
  sessionId: string,
  input: z.infer<typeof sessionSchema>
) {
  const parsed = sessionSchema.parse(input);
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase
    .from("treatment_sessions")
    .update({
      doctor_id: parsed.doctor_id,
      session_date: parsed.session_date,
      notes: parsed.notes,
    })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);

  // Înlocuiește manoperele ședinței cu cele din formular
  const { error: delError } = await supabase
    .from("session_items")
    .delete()
    .eq("session_id", sessionId);
  if (delError) throw new Error(delError.message);

  const { error: itemsError } = await supabase.from("session_items").insert(
    parsed.items.map((item) => ({
      clinic_id: clinicId,
      session_id: sessionId,
      procedure_id: item.procedure_id,
      tooth_codes: item.tooth_codes,
      note: item.note,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath(fisaPath(patientId));
}

export async function deleteSession(patientId: string, sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("treatment_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

// ---------------- Stare dinte ----------------

export async function setToothState(
  patientId: string,
  toothCode: string,
  status: string,
  note: string | null
) {
  if (!TOOTH_CODE.test(toothCode)) throw new Error("Cod dinte invalid");
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase.from("tooth_states").upsert(
    {
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_code: toothCode,
      status,
      note,
    },
    { onConflict: "patient_id,tooth_code" }
  );
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

// ---------------- Alerte ----------------

export async function addAlert(
  patientId: string,
  message: string,
  severity: "info" | "warning" | "critical"
) {
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase.from("patient_health_alerts").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    message_ro: message.trim(),
    severity,
  });
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

export async function dismissAlert(patientId: string, alertId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("patient_health_alerts")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", alertId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

// ---------------- Manopere & medici noi ----------------

export async function addProcedure(nameRo: string, categoryId: string) {
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { data, error } = await supabase
    .from("procedures")
    .insert({ clinic_id: clinicId, category_id: categoryId, name_ro: nameRo.trim() })
    .select("id, name_ro, category_id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addDoctor(fullName: string) {
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { data, error } = await supabase
    .from("doctors")
    .insert({ clinic_id: clinicId, full_name: fullName.trim(), is_collaborator: true })
    .select("id, full_name")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ---------------- Remindere ----------------

export async function addReminder(
  patientId: string,
  sessionId: string | null,
  dueDate: string,
  message: string,
  notifyPatient: boolean
) {
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase.from("reminders").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    session_id: sessionId,
    due_date: dueDate,
    message_ro: message.trim(),
    notify_patient: notifyPatient,
  });
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
  revalidatePath("/dashboard");
}

export async function updateReminder(
  reminderId: string,
  patientId: string,
  dueDate: string,
  message: string,
  notifyPatient: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .update({
      due_date: dueDate,
      message_ro: message.trim(),
      notify_patient: notifyPatient,
    })
    .eq("id", reminderId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
  revalidatePath("/dashboard");
}

export async function deleteReminder(reminderId: string, patientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminderId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
  revalidatePath("/dashboard");
}

export async function completeReminder(reminderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .update({ status: "done" })
    .eq("id", reminderId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

// ---------------- Lucrări protetice ----------------

const prostheticSchema = z.object({
  work_date: z.string().min(1),
  plan: z.string().nullable(),
  material: z.string().nullable(),
  color: z.string().nullable(),
  technician: z.string().nullable(),
});

export async function addProstheticWork(
  patientId: string,
  input: z.infer<typeof prostheticSchema>
) {
  const parsed = prostheticSchema.parse(input);
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase.from("prosthetic_works").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    ...parsed,
  });
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

export async function updateProstheticWork(
  patientId: string,
  workId: string,
  input: z.infer<typeof prostheticSchema>
) {
  const parsed = prostheticSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("prosthetic_works")
    .update(parsed)
    .eq("id", workId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}

export async function deleteProstheticWork(patientId: string, workId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("prosthetic_works")
    .delete()
    .eq("id", workId);
  if (error) throw new Error(error.message);
  revalidatePath(fisaPath(patientId));
}
