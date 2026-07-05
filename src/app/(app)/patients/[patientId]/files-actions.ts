"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClinicId } from "@/lib/clinic";

const BUCKET = "patient-files";
const SHARE_EXPIRY_SECONDS = 7 * 24 * 3600; // 7 zile

export async function registerFile(
  patientId: string,
  kind: "photo" | "radiograph",
  storagePath: string,
  fileName: string,
  mimeType: string,
  sizeBytes: number
) {
  const supabase = await createClient();
  const clinicId = await getClinicId();

  const { error } = await supabase.from("patient_files").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    kind,
    storage_path: storagePath,
    file_name: fileName,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/patients/${patientId}/fotografii`);
  revalidatePath(`/patients/${patientId}/radiografii`);
}

export async function deleteFile(patientId: string, fileId: string) {
  const supabase = await createClient();

  const { data: file, error } = await supabase
    .from("patient_files")
    .select("storage_path")
    .eq("id", fileId)
    .single();
  if (error || !file) throw new Error(error?.message ?? "Fișier inexistent");

  await supabase.storage.from(BUCKET).remove([file.storage_path]);
  const { error: delError } = await supabase
    .from("patient_files")
    .delete()
    .eq("id", fileId);
  if (delError) throw new Error(delError.message);

  revalidatePath(`/patients/${patientId}/fotografii`);
  revalidatePath(`/patients/${patientId}/radiografii`);
}

/** Link de partajare valabil 7 zile. */
export async function getShareUrl(storagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SHARE_EXPIRY_SECONDS);
  if (error || !data) throw new Error(error?.message ?? "Eroare la link");
  return data.signedUrl;
}
