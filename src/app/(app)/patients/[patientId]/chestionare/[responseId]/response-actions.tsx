"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { deleteQuestionnaire } from "../actions";

export function ResponseActions({
  patientId,
  responseId,
}: {
  patientId: string;
  responseId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="mr-1.5" />
        {ro.questionnaires.print}
      </Button>
      <Button
        variant="outline"
        disabled={pending}
        aria-label={ro.common.delete}
        onClick={() => {
          if (!confirm(ro.questionnaires.deleteConfirm)) return;
          startTransition(async () => {
            await deleteQuestionnaire(patientId, responseId);
            router.push(`/patients/${patientId}/chestionare`);
          });
        }}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}
