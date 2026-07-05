import { ro } from "@/i18n/ro";
import { FilesPage } from "../files-page";

export default async function RadiografiiPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <FilesPage
      patientId={patientId}
      kind="radiograph"
      title={ro.patientHub.radiografii}
    />
  );
}
