import crypto from "node:crypto";
import { detectFileFormatFromFilename, SUPPORTED_UPLOAD_FORMATS } from "@/services/import/parsing";
import type { ImportFileFormat } from "@/generated/prisma/enums";

// A real school's academic-structure/student/teacher register is at most a
// few thousand rows — a few hundred KB as CSV, low single-digit MB as
// XLSX. 10MB is a generous ceiling for that, and small enough that an
// oversized upload fails fast rather than tying up a Server Action for a
// file that was never going to be a legitimate register (Security Review —
// "large uploads").
export const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  format: ImportFileFormat | null;
  errors: string[];
}

/**
 * The File Validation layer of this sprint's own Validation Strategy —
 * runs before any parsing is attempted: file type (by extension — content
 * sniffing happens naturally when the matched parser tries to read the
 * bytes and throws FileParseError if they don't match), empty files,
 * maximum size. Deliberately does not attempt to detect "malicious"
 * content (macros, formulas) — reading an already-uploaded file's cell
 * *values* (exceljs, read-only) never executes anything in it; this
 * importer only ever reads text/number cell values, never a formula
 * result's underlying formula or a macro, so there is no code-execution
 * surface to sanitize here. See Security Review in
 * docs/DECISIONS.md's Sprint D3 entry.
 */
export function validateUploadedFile(fileName: string, sizeBytes: number): FileValidationResult {
  const errors: string[] = [];
  const format = detectFileFormatFromFilename(fileName);

  if (!format || !SUPPORTED_UPLOAD_FORMATS.includes(format)) {
    errors.push(`Unsupported file type. Upload a ${SUPPORTED_UPLOAD_FORMATS.join(" or ")} file.`);
  }
  if (sizeBytes === 0) {
    errors.push("The uploaded file is empty.");
  }
  if (sizeBytes > MAX_IMPORT_FILE_SIZE_BYTES) {
    errors.push(
      `The file is too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) — the maximum is ${MAX_IMPORT_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    );
  }

  return { valid: errors.length === 0, format, errors };
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
