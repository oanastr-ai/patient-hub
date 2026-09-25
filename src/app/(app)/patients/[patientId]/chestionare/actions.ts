"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClinicId } from "@/lib/clinic";
import { getTemplate, missingAnswers, pruneAnswers } from "@/lib/questionnaires";

const BUCKET = "patient-files";
const PNG_PREFIX = "data:image/png;base64,";
/** O semnătură desenată pe tabletă are zeci de KB; limita doar oprește abuzurile. */
const MAX_SIGNATURE_BYTES = 1_000_000;

const answersSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

function listPath(patientId: string) {
  return `/patients/${patientId}/chestionare`;
}

function decodeSignature(dataUrl: string | undefined): Buffer {
  if (!dataUrl?.startsWith(PNG_PREFIX)) throw new Error("Lipsește semnătura");
  const png = Buffer.from(dataUrl.slice(PNG_PREFIX.length), "base64");
  if (png.length === 0 || png.length > MAX_SIGNATURE_BYTES) {
    throw new Error("Semnătură invalidă");
  }
  return png;
}

export type Signatures = { patient: string; doctor?: string };

export async function saveQuestionnaire(
  patientId: string,
  templateCode: string,
  rawAnswers: unknown,
  signatures: Signatures
): Promise<{ id: string }> {
  const template = getTemplate(templateCode);
  if (!template) throw new Error("Chestionar inexistent");

  const answers = pruneAnswers(template, answersSchema.parse(rawAnswers));
  if (missingAnswers(template, answers).length > 0) {
    throw new Error("Chestionarul nu este completat în întregime");
  }

  const patientSignature = decodeSignature(signatures.patient);
  const doctorSignature = template.doctorSignature
    ? decodeSignature(signatures.doctor)
    : null;

  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { data: row, error } = await supabase
    .from("questionnaire_responses")
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      template_code: template.code,
      template_version: template.version,
      answers,
    })
    .select("id")
    .single();
  if (error || !row) throw new Error(error?.message ?? "Eroare la salvare");

  const signaturePath = `questionnaires/${patientId}/${row.id}.png`;
  const doctorSignaturePath = `questionnaires/${patientId}/${row.id}-medic.png`;
  const uploads = [
    supabase.storage
      .from(BUCKET)
      .upload(signaturePath, patientSignature, { contentType: "image/png" }),
    ...(doctorSignature
      ? [
          supabase.storage
            .from(BUCKET)
            .upload(doctorSignaturePath, doctorSignature, { contentType: "image/png" }),
        ]
      : []),
  ];
  const uploadError = (await Promise.all(uploads)).find((r) => r.error)?.error;
  if (uploadError) {
    // Fără semnături, documentul nu are valoare — nu lăsa un rând pe jumătate.
    await supabase.storage.from(BUCKET).remove([signaturePath, doctorSignaturePath]);
    await supabase.from("questionnaire_responses").delete().eq("id", row.id);
    throw new Error(uploadError.message);
  }

  const { error: updateError } = await supabase
    .from("questionnaire_responses")
    .update({
      signature_path: signaturePath,
      doctor_signature_path: doctorSignature ? doctorSignaturePath : null,
      signed_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(listPath(patientId));
  return { id: row.id };
}

export async function deleteQuestionnaire(patientId: string, responseId: string) {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("questionnaire_responses")
    .select("signature_path, doctor_signature_path")
    .eq("id", responseId)
    .single();
  if (error || !row) throw new Error(error?.message ?? "Chestionar inexistent");

  const files = [row.signature_path, row.doctor_signature_path].filter(
    (p): p is string => !!p
  );
  if (files.length) await supabase.storage.from(BUCKET).remove(files);
  const { error: delError } = await supabase
    .from("questionnaire_responses")
    .delete()
    .eq("id", responseId);
  if (delError) throw new Error(delError.message);

  revalidatePath(listPath(patientId));
}
