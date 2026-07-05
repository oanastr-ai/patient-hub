import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ro } from "@/i18n/ro";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReminderList, type ReminderRow } from "./reminder-list";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count }, { data: reminders }] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null),
    supabase
      .from("reminders")
      .select(
        "id, due_date, message_ro, notify_patient, patient:patients ( id, first_name, last_name )"
      )
      .eq("status", "pending")
      .order("due_date")
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">{ro.nav.dashboard}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/patients">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {ro.nav.patients}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{count ?? 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {ro.nav.agenda}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {ro.common.comingSoon}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl">{ro.reminders.upcoming}</h2>
        <ReminderList reminders={(reminders ?? []) as never as ReminderRow[]} />
      </section>
    </div>
  );
}
