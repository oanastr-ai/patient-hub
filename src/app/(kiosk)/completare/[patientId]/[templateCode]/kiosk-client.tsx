"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, X } from "lucide-react";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { getTemplate, type Answers } from "@/lib/questionnaires";
import { saveQuestionnaire } from "@/app/(app)/patients/[patientId]/chestionare/actions";

const t = ro.questionnaires;

export function KioskClient({
  patientId,
  templateCode,
  initialAnswers,
}: {
  patientId: string;
  templateCode: string;
  initialAnswers: Answers;
}) {
  const [savedId, setSavedId] = useState<string | null>(null);
  // Șablonul are funcții nu doar date, deci se ia din cod, nu din props.
  const template = getTemplate(templateCode)!;
  const backHref = `/patients/${patientId}/chestionare`;

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
          render={<Link href={`${backHref}/${savedId}`} />}
        >
          {t.backToPatient}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex justify-end">
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
        onSubmit={async (answers, signatures) => {
          const { id } = await saveQuestionnaire(patientId, templateCode, answers, signatures);
          window.scrollTo({ top: 0 });
          setSavedId(id);
        }}
      />
    </>
  );
}
