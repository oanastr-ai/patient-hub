import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientNav } from "@/components/patient-nav";

export default async function PatientLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ patientId: string }>;
}>) {
  const { patientId } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .eq("id", patientId)
    .single();

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <PatientNav
        patientId={patient.id}
        patientName={`${patient.last_name} ${patient.first_name}`}
      />
      {children}
    </div>
  );
}
