import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ClipboardList,
  FileSignature,
  Stethoscope,
  Camera,
  ScanLine,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  { slug: "chestionare", label: ro.patientHub.chestionare, icon: ClipboardList },
  { slug: "plan-tratament", label: ro.patientHub.planTratament, icon: FileSignature },
  { slug: "fisa-tratament", label: ro.patientHub.fisaTratament, icon: Stethoscope },
  { slug: "fotografii", label: ro.patientHub.fotografii, icon: Camera },
  { slug: "radiografii", label: ro.patientHub.radiografii, icon: ScanLine },
];

export default async function PatientHubPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, first_name, last_name, birth_date, phone, email")
    .eq("id", patientId)
    .single();

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            {patient.last_name} {patient.first_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.birth_date
              ? new Date(patient.birth_date).toLocaleDateString("ro-RO")
              : ""}
            {patient.phone ? ` · ${patient.phone}` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/patients/${patient.id}/edit`} />}
        >
          <Pencil className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{ro.common.edit}</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {sections.map(({ slug, label, icon: Icon }) => (
          <Link key={slug} href={`/patients/${patient.id}/${slug}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
