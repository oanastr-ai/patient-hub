import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FisaClient } from "./fisa-client";

type ToothStateRow = {
  tooth_code: string;
  status: string;
  note: string | null;
  surfaces: Record<string, string> | null;
  periapical: number[] | null;
};

/**
 * Stările dinților, tolerant la lipsa coloanei `periapical` (migrarea 0004).
 * Fără asta, o singură coloană nouă ar face să pice tot select-ul, iar
 * odontograma s-ar goli în tăcere — marcajele există, dar nu mai sunt citite.
 */
async function readToothStates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string
): Promise<{ data: ToothStateRow[] }> {
  const full = await supabase
    .from("tooth_states")
    .select("tooth_code, status, note, surfaces, periapical")
    .eq("patient_id", patientId);
  if (!full.error) return { data: (full.data ?? []) as ToothStateRow[] };

  console.warn(
    `[fisa] citirea stărilor dinților a eșuat (${full.error.message}); ` +
      "reîncerc fără `periapical` — rulează migrarea 0004_tooth_states_v2.sql"
  );
  const fallback = await supabase
    .from("tooth_states")
    .select("tooth_code, status, note, surfaces")
    .eq("patient_id", patientId);
  if (fallback.error) throw new Error(fallback.error.message);
  return {
    data: (fallback.data ?? []).map((r) => ({ ...r, periapical: null })) as ToothStateRow[],
  };
}

export default async function FisaTratamentPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();

  const [
    { data: patient },
    { data: alerts },
    { data: sessions },
    { data: toothStates },
    { data: doctors },
    { data: categories },
    { data: procedures },
    { data: prosthetics },
    { data: reminders },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("id", patientId)
      .single(),
    supabase
      .from("patient_health_alerts")
      .select("id, message_ro, severity")
      .eq("patient_id", patientId)
      .is("dismissed_at", null)
      .order("severity"),
    supabase
      .from("treatment_sessions")
      .select(
        `id, session_date, notes,
         doctor:doctors ( id, full_name ),
         items:session_items ( id, tooth_codes, note, procedure:procedures ( id, name_ro ) )`
      )
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false }),
    readToothStates(supabase, patientId),
    supabase
      .from("doctors")
      .select("id, full_name, is_collaborator")
      // Medicul cabinetului (necolaborator) primul, apoi colaboratorii alfabetic
      .eq("is_active", true)
      .order("is_collaborator")
      .order("full_name"),
    supabase
      .from("procedure_categories")
      .select("id, code, name_ro, sort_order")
      .order("sort_order"),
    supabase
      .from("procedures")
      .select("id, name_ro, category_id")
      .eq("is_active", true)
      .order("name_ro"),
    supabase
      .from("prosthetic_works")
      .select(
        "id, work_date, plan, material, color, technician, tooth_codes, work_type"
      )
      .eq("patient_id", patientId)
      .order("work_date", { ascending: false }),
    supabase
      .from("reminders")
      .select("id, session_id, due_date, message_ro, notify_patient")
      .eq("patient_id", patientId)
      .eq("status", "pending")
      .order("due_date"),
  ]);

  if (!patient) notFound();

  return (
    <FisaClient
      patient={patient}
      alerts={alerts ?? []}
      sessions={(sessions ?? []) as never}
      toothStates={toothStates ?? []}
      doctors={doctors ?? []}
      categories={categories ?? []}
      procedures={procedures ?? []}
      prosthetics={prosthetics ?? []}
      reminders={reminders ?? []}
    />
  );
}
