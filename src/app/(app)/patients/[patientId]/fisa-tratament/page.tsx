import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FisaClient } from "./fisa-client";

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
    supabase
      .from("tooth_states")
      .select("tooth_code, status, note")
      .eq("patient_id", patientId),
    supabase
      .from("doctors")
      .select("id, full_name")
      .eq("is_active", true)
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
      .select("id, work_date, plan, material, color, technician")
      .eq("patient_id", patientId)
      .order("work_date", { ascending: false }),
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
    />
  );
}
