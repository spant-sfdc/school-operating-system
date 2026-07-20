import type { ImportFileFormat } from "@/generated/prisma/enums";

// What every parser produces, regardless of source format — the one shape
// the rest of the Import Engine ever sees. "Importer must never know
// parser type" (this sprint's own instruction): nothing downstream of
// parseImportFile() imports papaparse or exceljs, or branches on
// ImportFileFormat at all.
export interface ParsedFile {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface FileParser {
  format: ImportFileFormat;
  parse(buffer: Buffer): Promise<ParsedFile>;
}

// Thrown by a parser when the file's bytes don't match its claimed format
// (a corrupted file, or a renamed-extension mismatch) — caught by the
// Upload orchestration and surfaced as a clear, actionable error, never an
// unhandled 500.
export class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileParseError";
  }
}
