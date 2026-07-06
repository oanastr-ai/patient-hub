"use client";

import Link from "next/link";
import { useTransition } from "react";
import { BellRing, Check, Trash2, User } from "lucide-react";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReminderEditDialog } from "@/components/reminder-edit-dialog";
import { relativeDue } from "@/lib/dates";
import {
  completeReminder,
  deleteReminder,
} from "@/app/(app)/patients/[patientId]/fisa-tratament/actions";

export type ReminderRow = {
  id: string;
  due_date: string;
  message_ro: string;
  notify_patient: boolean;
  patient: { id: string; first_name: string; last_name: string } | null;
};

export function ReminderList({ reminders }: { reminders: ReminderRow[] }) {
  const [pending, startTransition] = useTransition();

  if (reminders.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {ro.reminders.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {reminders.map((r) => {
        const rel = relativeDue(r.due_date);
        return (
          <li
            key={r.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm",
              rel.overdue && "border-red-400/60"
            )}
          >
            <BellRing
              className={cn(
                "h-4 w-4 shrink-0",
                rel.overdue ? "text-red-600" : "text-primary"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.message_ro}</p>
              <p className="text-xs text-muted-foreground">
                {r.patient && (
                  <Link
                    href={`/patients/${r.patient.id}/fisa-tratament`}
                    className="hover:underline"
                  >
                    {r.patient.last_name} {r.patient.first_name}
                  </Link>
                )}
                {" · "}
                {new Date(r.due_date + "T00:00:00").toLocaleDateString("ro-RO")}
                {" — "}
                <span
                  className={cn(
                    "font-semibold",
                    rel.overdue ? "text-red-600" : "text-primary"
                  )}
                >
                  {rel.label}
                </span>
                {r.notify_patient && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5">
                    <User className="h-3 w-3" />
                    {ro.reminders.forPatient}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {r.patient && (
                <ReminderEditDialog reminder={r} patientId={r.patient.id} />
              )}
              <Button
                size="sm"
                variant="outline"
                title={ro.common.delete}
                disabled={pending}
                onClick={() => {
                  if (confirm(ro.common.deleteConfirm)) {
                    startTransition(() =>
                      deleteReminder(r.id, r.patient?.id ?? "")
                    );
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => startTransition(() => completeReminder(r.id))}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {ro.reminders.markDone}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
