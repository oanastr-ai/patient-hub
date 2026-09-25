import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import { getTemplate, positiveFindings, type Answers } from "@/lib/questionnaires";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionnaireDocument } from "@/components/questionnaire/questionnaire-document";
import { ResponseActions } from "./response-actions";

const t = ro.questionnaires;

export default async function QuestionnaireResponsePage({
  params,
}: {
  params: Promise<{ patientId: string; responseId: string }>;
}) {
  const { patientId, responseId } = await params;
  const supabase = await createClient();

  const { data: response } = await supabase
    .from("questionnaire_responses")
    .select(
      "id, template_code, template_version, answers, signature_path, doctor_signature_path, signed_at"
    )
    .eq("id", responseId)
    .eq("patient_id", patientId)
    .single();
  if (!response) notFound();

  const template = getTemplate(response.template_code, response.template_version);
  if (!template) notFound();

  const answers = response.answers as Answers;
  const findings = positiveFindings(template, answers);

  const signedUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("patient-files").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };
  const [patientSignature, doctorSignature] = await Promise.all([
    signedUrl(response.signature_path),
    signedUrl(response.doctor_signature_path),
  ]);
  const signatures = [
    { label: template.signatureLabel, url: patientSignature },
    ...(template.doctorSignature ? [{ label: t.doctorSignature, url: doctorSignature }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-semibold">{template.shortTitle}</h1>
        <ResponseActions patientId={patientId} responseId={response.id} />
      </div>

      {template.summary !== false && (
        <Card className="print:hidden">
          <CardContent className="space-y-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 text-amber-600" />
              {t.findings}
            </h2>
            {findings.length === 0 ? (
              <p className="text-muted-foreground">{t.noFindings}</p>
            ) : (
              <ul className="space-y-1.5">
                {findings.map((f, i) => (
                  <li
                    key={i}
                    className={cn("rounded-lg px-3 py-2", f.alert ? "bg-destructive/10" : "bg-muted")}
                  >
                    <span className={cn("font-medium", f.alert && "text-destructive")}>{f.label}</span>
                    {f.value !== "da" && <span className="text-foreground/80"> — {f.value}</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <QuestionnaireDocument
        template={template}
        answers={answers}
        signatures={signatures}
        signedAt={response.signed_at}
      />
    </div>
  );
}
