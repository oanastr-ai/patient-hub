import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AppNav />
      {/* pb-20 lasă loc pentru bara de navigare de jos pe mobil */}
      <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
    </div>
  );
}
