import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Modul pacient: ecrane pe care le completează pacientul pe tabletă, fără
 * meniul aplicației. Tableta rămâne însă logată pe contul cabinetului.
 */
export default async function KioskLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </main>
  );
}
