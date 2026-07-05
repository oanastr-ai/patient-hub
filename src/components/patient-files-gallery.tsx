"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Loader2,
  MessageCircle,
  Link as LinkIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ro } from "@/i18n/ro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { registerFile, deleteFile, getShareUrl } from "@/app/(app)/patients/[patientId]/files-actions";

const BUCKET = "patient-files";

export type PatientFile = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  created_at: string;
  /** URL semnat pentru afișare, generat pe server */
  url: string | null;
};

export function PatientFilesGallery({
  patientId,
  kind,
  title,
  files,
}: {
  patientId: string;
  kind: "photo" | "radiograph";
  title: string;
  files: PatientFile[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const supabase = createClient();
      for (const file of Array.from(fileList)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${patientId}/${kind}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
        await registerFile(patientId, kind, path, file.name, file.type, file.size);
      }
      router.refresh();
    } catch (err) {
      alert(ro.common.error + " " + (err instanceof Error ? err.message : ""));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(file: PatientFile) {
    const url = await getShareUrl(file.storage_path);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.file_name;
    a.click();
  }

  async function handleCopyLink(file: PatientFile) {
    const url = await getShareUrl(file.storage_path);
    await navigator.clipboard.writeText(url);
    setCopied(file.id);
    setTimeout(() => setCopied(null), 2500);
  }

  async function handleWhatsApp(file: PatientFile) {
    const url = await getShareUrl(file.storage_path);
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? ro.files.uploading : ro.files.upload}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          capture={undefined}
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {ro.files.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden py-0 gap-0">
              {file.url && file.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.file_name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square w-full flex items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center break-all">
                  {file.file_name}
                </div>
              )}
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
                <span>{new Date(file.created_at).toLocaleDateString("ro-RO")}</span>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleDownload(file)}
                    title={ro.files.download}
                    className="p-1.5 hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleWhatsApp(file)}
                    title={ro.files.shareWhatsApp}
                    className="p-1.5 hover:text-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCopyLink(file)}
                    title={copied === file.id ? ro.files.linkCopied : ro.files.copyLink}
                    className={
                      copied === file.id
                        ? "p-1.5 text-green-600"
                        : "p-1.5 hover:text-foreground"
                    }
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(ro.files.deleteConfirm)) {
                        startTransition(() => deleteFile(patientId, file.id));
                      }
                    }}
                    title={ro.common.delete}
                    className="p-1.5 hover:text-destructive"
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {copied && (
        <p className="text-sm text-green-600 text-center">{ro.files.linkCopied}</p>
      )}
    </div>
  );
}
