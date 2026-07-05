import { ro } from "@/i18n/ro";
import { PatientForm } from "../patient-form";
import { savePatient } from "../actions";

export default function NewPatientPage() {
  const action = savePatient.bind(null, null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{ro.patients.add}</h1>
      <PatientForm action={action} />
    </div>
  );
}
