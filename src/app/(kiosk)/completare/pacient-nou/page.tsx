import Link from "next/link";
import { X } from "lucide-react";
import { ro } from "@/i18n/ro";
import { IntakeForm } from "./intake-form";

/** Primul ecran pentru un pacient nou: datele personale, o singură dată. */
export default function PacientNouPage() {
  return (
    <>
      <div className="mb-2 flex justify-end">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          {ro.questionnaires.exitKiosk}
        </Link>
      </div>
      <IntakeForm />
    </>
  );
}
