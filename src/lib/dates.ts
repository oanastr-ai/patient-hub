import { ro } from "@/i18n/ro";

/** Countdown relativ pentru o dată scadentă (ex: "în 12 zile", "azi", "întârziat"). */
export function relativeDue(dueDate: string): { label: string; overdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: ro.reminders.overdue, overdue: true };
  if (diff === 0) return { label: ro.reminders.today, overdue: false };
  return { label: ro.reminders.inDays(diff), overdue: false };
}
