import Papa from "papaparse";
import type { FileParser, ParsedFile } from "@/services/import/parsing/types";
import { FileParseError } from "@/services/import/parsing/types";

// papaparse, not a hand-rolled splitter — real CSV needs RFC 4180 quoting
// (a comma or newline inside a quoted field) handled correctly, which a
// naive `line.split(",")` gets wrong on real school spreadsheets export
// from Excel/Google Sheets. See docs/DECISIONS.md's Sprint D3 entry for
// why this dependency was added.
export const csvParser: FileParser = {
  format: "CSV",
  async parse(buffer: Buffer): Promise<ParsedFile> {
    const text = buffer.toString("utf-8");
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // papaparse doesn't throw on malformed CSV — it collects per-row
    // errors instead. A `Delimiter`/`Quotes` error type means the file
    // isn't really CSV (e.g. a binary file renamed .csv) — treat that as
    // corrupted; a stray `FieldMismatch` on one row is tolerated (papaparse
    // still parses the row, just pads/truncates it) since real spreadsheets
    // occasionally have a ragged trailing row.
    const fatalError = result.errors.find(
      (error) => error.type === "Delimiter" || error.type === "Quotes",
    );
    if (fatalError) {
      throw new FileParseError(`This file does not look like valid CSV: ${fatalError.message}`);
    }

    const columns = result.meta.fields ?? [];
    if (columns.length === 0) {
      throw new FileParseError("The CSV file has no header row.");
    }

    return { columns, rows: result.data };
  },
};
