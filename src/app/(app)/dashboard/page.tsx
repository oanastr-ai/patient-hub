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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .is("archived_at", null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{ro.nav.dashboard}</h1>
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
    </div>
  );
}
