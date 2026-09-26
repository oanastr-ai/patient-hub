import Link from "next/link";
import { ChevronRight, ClipboardList, Languages, TabletSmartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import { CURRENT_TEMPLATES, INTAKE_FLOW, getTemplate } from "@/lib/questionnaires";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const t = ro.questionnaires;

export default async function ChestionarePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();

  const { data: responses, error } = await supabase
    .from("questionnaire_responses")
    .select("id, template_code, template_version, signed_at, created_at, language")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{ro.patientHub.chestionare}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/completare/${patientId}/${INTAKE_FLOW[0]}?flux=nou`} />}
          >
            <TabletSmartphone className="mr-1.5" />
            {ro.intake.startAll}
          </Button>
          <Button
            variant="outline"
            title={t.fillInEnglishHint}
            nativeButton={false}
            render={<Link href={`/completare/${patientId}/${INTAKE_FLOW[0]}?flux=nou&lang=en`} />}
          >
            <Languages className="mr-1.5" />
            {t.fillInEnglish}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CURRENT_TEMPLATES.map((tpl) => (
          <Card key={tpl.code}>
            <CardContent className="flex flex-col gap-4 py-5">
              <div className="flex items-center gap-3">
                <ClipboardList className="size-6 text-primary" />
                <span className="font-medium">{tpl.shortTitle}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={`/completare/${patientId}/${tpl.code}`} />}
                >
                  <TabletSmartphone className="mr-1.5" />
                  {t.fillOnTablet}
                </Button>
                <Button
                  variant="outline"
                  title={t.fillInEnglishHint}
                  nativeButton={false}
                  render={<Link href={`/completare/${patientId}/${tpl.code}?lang=en`} />}
                >
                  <Languages className="mr-1.5" />
                  {t.fillInEnglish}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.completed}</h2>
        {!responses?.length ? (
          <p className="text-muted-foreground">{t.empty}</p>
        ) : (
          <Card className="divide-y py-0">
            {responses.map((r) => {
              const tpl = getTemplate(r.template_code, r.template_version);
              const date = new Date(r.signed_at ?? r.created_at);
              return (
                <Link
                  key={r.id}
                  href={`/patients/${patientId}/chestionare/${r.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <div>
                    <p className="font-medium">{tpl?.shortTitle ?? r.template_code}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.signedAt} {date.toLocaleDateString("ro-RO")}{" "}
                      {date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      {r.language === "en" && ` · ${t.signedInEnglish}`}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}
