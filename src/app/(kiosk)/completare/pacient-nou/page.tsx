import Link from "next/link";
import { X } from "lucide-react";
import { kioskText, parseLang } from "@/i18n/kiosk";
import { IntakeForm } from "./intake-form";

/** Primul ecran pentru un pacient nou: datele personale, o singură dată. */
export default async function PacientNouPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const lang = parseLang((await searchParams).lang);
  return (
    <>
      <div className="mb-2 flex justify-end">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          {kioskText(lang).questionnaires.exitKiosk}
        </Link>
      </div>
      <IntakeForm lang={lang} />
    </>
  );
}
