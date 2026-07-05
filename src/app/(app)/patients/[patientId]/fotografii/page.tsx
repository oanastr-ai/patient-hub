import { ro } from "@/i18n/ro";
import { FilesPage } from "../files-page";

export default async function FotografiiPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <FilesPage
      patientId={patientId}
      kind="photo"
      title={ro.patientHub.fotografii}
    />
  );
}
