import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PatientFilesGallery,
  type PatientFile,
} from "@/components/patient-files-gallery";

const BUCKET = "patient-files";
const VIEW_EXPIRY_SECONDS = 3600; // 1 oră pentru thumbnails

/** Pagină comună pentru Fotografii și Radiografii. */
export async function FilesPage({
  patientId,
  kind,
  title,
}: {
  patientId: string;
  kind: "photo" | "radiograph";
  title: string;
}) {
  const supabase = await createClient();

  const [{ data: patient }, { data: files }] = await Promise.all([
    supabase.from("patients").select("id").eq("id", patientId).single(),
    supabase
      .from("patient_files")
      .select("id, storage_path, file_name, mime_type, created_at")
      .eq("patient_id", patientId)
      .eq("kind", kind)
      .order("created_at", { ascending: false }),
  ]);

  if (!patient) notFound();

  const withUrls: PatientFile[] = await Promise.all(
    (files ?? []).map(async (f) => {
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(f.storage_path, VIEW_EXPIRY_SECONDS);
      return { ...f, url: data?.signedUrl ?? null };
    })
  );

  return (
    <PatientFilesGallery
      patientId={patientId}
      kind={kind}
      title={title}
      files={withUrls}
    />
  );
}
