import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import { PatientList } from "./patient-list";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name, phone, birth_date")
    .is("archived_at", null)
    .order("last_name")
    .order("first_name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{ro.patients.title}</h1>
      <PatientList patients={patients ?? []} />
    </div>
  );
}
