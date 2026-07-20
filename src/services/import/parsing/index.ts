import type { ImportFileFormat } from "@/generated/prisma/enums";
import { csvParser } from "@/services/import/parsing/csvParser";
import { xlsxParser } from "@/services/import/parsing/xlsxParser";
import type { ParsedFile, FileParser } from "@/services/import/parsing/types";

export type { ParsedFile, FileParser } from "@/services/import/parsing/types";
export { FileParseError } from "@/services/import/parsing/types";

// The one registry a future ODS parser joins — "the importer must never
// know parser type" (this sprint's own instruction): every caller goes
// through parseImportFile()/detectFileFormatFromFilename() below, never
// imports csvParser/xlsxParser directly or branches on format itself.
const PARSERS: Record<ImportFileFormat, FileParser> = {
  CSV: csvParser,
  XLSX: xlsxParser,
  // ODS: named as a future format (ImportFileFormat already includes it,
  // Sprint D1), no parser implementation yet — see this sprint's own
  // "Do NOT build" scope and docs/DECISIONS.md's Sprint D3 entry.
  ODS: {
    format: "ODS",
    async parse() {
      throw new Error("ODS parsing is not yet implemented — CSV and XLSX are supported today.");
    },
  },
};

export async function parseImportFile(
  buffer: Buffer,
  format: ImportFileFormat,
): Promise<ParsedFile> {
  return PARSERS[format].parse(buffer);
}

const EXTENSION_FORMATS: Record<string, ImportFileFormat> = {
  csv: "CSV",
  xlsx: "XLSX",
  ods: "ODS",
};

// Upload's own "reject unsupported formats" check — the file extension is
// the one signal available before any parsing is attempted at all.
export function detectFileFormatFromFilename(fileName: string): ImportFileFormat | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return null;
  return EXTENSION_FORMATS[extension] ?? null;
}

export const SUPPORTED_UPLOAD_FORMATS: ImportFileFormat[] = ["CSV", "XLSX"];
