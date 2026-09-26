import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTemplate, type Answers } from "@/lib/questionnaires";
import { parseLang } from "@/i18n/kiosk";
import { KioskClient } from "./kiosk-client";

export default async function CompletarePage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string; templateCode: string }>;
  searchParams: Promise<{ flux?: string; lang?: string }>;
}) {
  const { patientId, templateCode } = await params;
  const { flux, lang: langParam } = await searchParams;
  const lang = parseLang(langParam);
  const template = getTemplate(templateCode, undefined, lang);
  if (!template) notFound();

  const supabase = await createClient();
  const [{ data: patient }, { data: previous }] = await Promise.all([
    supabase
      .from("patients")
      .select(
        "id, first_name, last_name, address, cnp, phone, email, occupation, id_card_series, id_card_number"
      )
      .eq("id", patientId)
      .single(),
    supabase
      .from("questionnaire_responses")
      .select("template_code, answers")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
  ]);
  if (!patient) notFound();

  // Ultimele răspunsuri pe fiecare chestionar (lista vine de la cel mai nou).
  const latest: Record<string, Answers> = {};
  for (const r of previous ?? []) latest[r.template_code] ??= r.answers as Answers;

  const patientName = `${patient.last_name} ${patient.first_name}`;
  // Datele cunoscute se precompletează; pacientul le poate corecta.
  const initialAnswers =
    template.prefill?.({
      patientName,
      address: patient.address,
      cnp: patient.cnp,
      phone: patient.phone,
      email: patient.email,
      occupation: patient.occupation,
      idCardSeries: patient.id_card_series,
      idCardNumber: patient.id_card_number,
      latest,
    }) ?? {};

  return (
    <KioskClient
      // Fiecare document pornește de la zero, și când se trece la următorul din flux.
      key={`${template.code}-${lang}`}
      patientId={patient.id}
      templateCode={template.code}
      initialAnswers={initialAnswers}
      intake={flux === "nou"}
      lang={lang}
    />
  );
}
