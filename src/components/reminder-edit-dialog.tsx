"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/ui/date-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateReminder } from "@/app/(app)/patients/[patientId]/fisa-tratament/actions";

export type EditableReminder = {
  id: string;
  due_date: string;
  message_ro: string;
  notify_patient: boolean;
};

export function ReminderEditDialog({
  reminder,
  patientId,
}: {
  reminder: EditableReminder;
  patientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState(reminder.due_date);
  const [message, setMessage] = useState(reminder.message_ro);
  const [notifyPatient, setNotifyPatient] = useState(reminder.notify_patient);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        title={ro.common.edit}
        onClick={() => {
          setDueDate(reminder.due_date);
          setMessage(reminder.message_ro);
          setNotifyPatient(reminder.notify_patient);
          setOpen(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ro.reminders.edit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit_rem_date">{ro.reminders.dueDate}</Label>
              <DateField
                id="edit_rem_date"
                value={dueDate}
                onChange={setDueDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_rem_msg">{ro.reminders.message}</Label>
              <textarea
                id="edit_rem_msg"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyPatient}
                onChange={(e) => setNotifyPatient(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {ro.reminders.notifyPatient}
            </label>
            <Button
              disabled={pending || !message.trim() || !dueDate}
              onClick={() =>
                startTransition(async () => {
                  await updateReminder(
                    reminder.id,
                    patientId,
                    dueDate,
                    message,
                    notifyPatient
                  );
                  setOpen(false);
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
