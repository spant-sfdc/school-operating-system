import { redirect } from "next/navigation";

import { requirePermission, canManageImports } from "@/lib/authorization";
import {
  uploadImportFile,
  UploadValidationError,
  SUPPORTED_UPLOAD_FORMATS,
} from "@/services/import";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// The Upload stage — a deliberately plain, functional form (this sprint's
// own "no UI polish" instruction). File Validation, parsing, Detection,
// and Data Profiling all happen inside uploadImportFile() itself — this
// page's own job is only to collect the file and hand it off, then
// redirect to Mapping with the resulting batch id.
export default async function ImportUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requirePermission(canManageImports);
  const params = await searchParams;

  async function uploadAction(formData: FormData) {
    "use server";

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      redirect("/admin/imports/upload?error=" + encodeURIComponent("Choose a file to upload."));
    }

    const buffer = Buffer.from(await (file as File).arrayBuffer());

    // redirect() throws internally (Next.js's own NEXT_REDIRECT signal) —
    // only the call that can genuinely fail belongs inside try/catch; see
    // src/app/admin/imports/mapping/page.tsx's own comment for the live
    // bug this exact pattern caused there when the success redirect() was
    // still inside the try block.
    let batchId: string;
    try {
      const result = await uploadImportFile(
        { schoolId: session.schoolId, fileName: (file as File).name, fileBuffer: buffer },
        session.userId,
      );
      batchId = result.batch.id;
    } catch (error) {
      if (error instanceof UploadValidationError) {
        redirect("/admin/imports/upload?error=" + encodeURIComponent(error.errors.join(" ")));
      }
      throw error;
    }

    redirect(`/admin/imports/mapping?batchId=${batchId}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Upload Import File</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Upload a {SUPPORTED_UPLOAD_FORMATS.join(" or ")} file. The system will detect the import
        type and suggest a column mapping on the next step — nothing is committed until you confirm
        a Preview.
      </p>

      <form action={uploadAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="file">File</Label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,.xlsx"
            required
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </div>
        {params.error ? (
          <p role="alert" className="text-destructive text-sm">
            {params.error}
          </p>
        ) : null}
        <Button type="submit" className="w-fit">
          Upload
        </Button>
      </form>
    </main>
  );
}
