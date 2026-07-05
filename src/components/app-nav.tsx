"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Calendar, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: ro.nav.dashboard, icon: Home },
  { href: "/patients", label: ro.nav.patients, icon: Users },
  { href: "/agenda", label: ro.nav.agenda, icon: Calendar },
  { href: "/setari", label: ro.nav.settings, icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar — tabletă și desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:bg-card md:min-h-screen">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-lg text-primary">{ro.app.name}</h1>
          <p className="text-xs text-muted-foreground">{ro.app.clinicName}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground hover:text-foreground border-t"
        >
          <LogOut className="h-4 w-4" />
          {ro.auth.signOut}
        </button>
      </aside>

      {/* Bara de jos — telefon */}
      <nav className="fixed bottom-0 inset-x-0 z-50 flex border-t bg-card md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              pathname.startsWith(href)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
