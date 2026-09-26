"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, X } from "lucide-react";
import { kioskQuery, kioskText, type Lang } from "@/i18n/kiosk";
import { Button } from "@/components/ui/button";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { INTAKE_FLOW, getTemplate, nextInIntake, type Answers } from "@/lib/questionnaires";
import { saveQuestionnaire } from "@/app/(app)/patients/[patientId]/chestionare/actions";

export function KioskClient({
  patientId,
  templateCode,
  initialAnswers,
  intake,
  lang,
}: {
  patientId: string;
  templateCode: string;
  initialAnswers: Answers;
  /** Face parte din fluxul de primă consultație (chestionarele la rând). */
  intake: boolean;
  lang: Lang;
}) {
  const [savedId, setSavedId] = useState<string | null>(null);
  const text = kioskText(lang);
  const t = text.questionnaires;
  // Șablonul are funcții nu doar date, deci se ia din cod, nu din props.
  const template = getTemplate(templateCode, undefined, lang)!;
  const backHref = `/patients/${patientId}/chestionare`;
  const next = intake ? nextInIntake(templateCode, lang) : undefined;
  const step = INTAKE_FLOW.indexOf(templateCode) + 1;

  if (savedId && next) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <CircleCheck className="size-16 text-primary" strokeWidth={1.5} />
        <h1 className="text-3xl font-semibold">{text.intake.nextTitle}</h1>
        <p className="text-lg text-muted-foreground">{text.intake.nextBody}</p>
        <p className="text-xl font-medium">{next.shortTitle}</p>
        <Button
          className="mt-4 h-14 min-w-64 text-lg"
          nativeButton={false}
          render={<Link href={`/completare/${patientId}/${next.code}${kioskQuery(true, lang)}`} />}
        >
          {text.intake.continue}
        </Button>
      </div>
    );
  }

  if (savedId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <CircleCheck className="size-16 text-primary" strokeWidth={1.5} />
        <h1 className="text-3xl font-semibold">{t.thanksTitle}</h1>
        <p className="max-w-md text-lg text-muted-foreground">{t.thanksBody}</p>
        <Button
          variant="outline"
          className="mt-6"
          nativeButton={false}
          render={<Link href={intake ? backHref : `${backHref}/${savedId}`} />}
        >
          {t.backToPatient}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {intake && step > 0 && `${text.intake.step} ${step} ${text.intake.of} ${INTAKE_FLOW.length}`}
        </span>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          {t.exitKiosk}
        </Link>
      </div>
      <QuestionnaireForm
        template={template}
        initialAnswers={initialAnswers}
        lang={lang}
        onSubmit={async (answers, signatures) => {
          const { id } = await saveQuestionnaire(patientId, templateCode, answers, signatures, lang);
          window.scrollTo({ top: 0 });
          setSavedId(id);
        }}
      />
    </>
  );
}
