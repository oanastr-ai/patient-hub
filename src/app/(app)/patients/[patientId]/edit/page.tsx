import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import { PatientForm } from "../../patient-form";
import { savePatient } from "../../actions";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  if (!patient) notFound();

  const action = savePatient.bind(null, patientId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        {ro.common.edit}: {patient.last_name} {patient.first_name}
      </h1>
      <PatientForm patient={patient} action={action} />
    </div>
  );
}
