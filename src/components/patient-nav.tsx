"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "", label: ro.patientNav.profile },
  { slug: "chestionare", label: ro.patientHub.chestionare },
  { slug: "plan-tratament", label: ro.patientHub.planTratament },
  { slug: "fisa-tratament", label: ro.patientHub.fisaTratament },
  { slug: "fotografii", label: ro.patientHub.fotografii },
  { slug: "radiografii", label: ro.patientHub.radiografii },
];

export function PatientNav({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const pathname = usePathname();
  const base = `/patients/${patientId}`;
  const currentSlug = pathname.slice(base.length).split("/").filter(Boolean)[0] ?? "";
  const currentTab = TABS.find((t) => t.slug === currentSlug);

  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/patients" className="transition-colors hover:text-foreground">
          {ro.nav.patients}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={base}
          className={cn(
            "transition-colors hover:text-foreground",
            !currentSlug && "font-medium text-foreground"
          )}
        >
          {patientName}
        </Link>
        {currentTab && currentTab.slug && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{currentTab.label}</span>
          </>
        )}
      </nav>

      {/* Tab-uri */}
      <div className="flex gap-1 overflow-x-auto border-b pb-px -mx-1 px-1">
        {TABS.map((tab) => {
          const href = tab.slug ? `${base}/${tab.slug}` : base;
          const active = currentSlug === tab.slug;
          return (
            <Link
              key={tab.slug}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
