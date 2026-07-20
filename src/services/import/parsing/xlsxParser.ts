import ExcelJS from "exceljs";
import type { FileParser, ParsedFile } from "@/services/import/parsing/types";
import { FileParseError } from "@/services/import/parsing/types";

// exceljs, not the SheetJS `xlsx` package — actively published security
// fixes to npm (unlike `xlsx`'s own npm-publishing gap around its
// prototype-pollution/ReDoS advisories, GHSA-4r6h-8v6p-xvw6 and
// GHSA-5pgg-2g8v-p4x9); read-only usage here, matching the smallest
// capability this sprint actually needs. See docs/DECISIONS.md's Sprint D3
// entry.
export const xlsxParser: FileParser = {
  format: "XLSX",
  async parse(buffer: Buffer): Promise<ParsedFile> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch {
      throw new FileParseError("This file does not look like a valid Excel (.xlsx) workbook.");
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new FileParseError("The workbook has no sheets.");
    }

    const headerRow = worksheet.getRow(1);
    const columns: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      columns.push(String(cell.value ?? "").trim());
    });
    if (columns.length === 0) {
      throw new FileParseError("The first sheet has no header row.");
    }

    const rows: Record<string, unknown>[] = [];
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (row.cellCount === 0) continue;

      const rowData: Record<string, unknown> = {};
      let hasValue = false;
      columns.forEach((column, index) => {
        const cell = row.getCell(index + 1);
        const value = cell.value;
        if (value != null && value !== "") hasValue = true;
        rowData[column] =
          typeof value === "object" && value !== null && "text" in value
            ? (value as { text: string }).text
            : value;
      });
      if (hasValue) rows.push(rowData);
    }

    return { columns, rows };
  },
};
