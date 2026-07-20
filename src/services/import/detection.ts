import { IMPORT_PROFILES } from "@/services/import/profiles";
import type { ImportEntityType } from "@/generated/prisma/enums";

function normalize(column: string): string {
  return column
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export interface DetectionResult {
  importType: ImportEntityType | null;
  confidence: number;
  scores: Array<{ importType: ImportEntityType; label: string; score: number }>;
}

/**
 * Deterministic Import Type detection — no AI, per this sprint's explicit
 * instruction. Scores every registered ImportProfile by how many of the
 * uploaded file's own columns match that profile's alias dictionary
 * (case/whitespace-normalized exact match, the same normalization
 * suggestColumnMapping() uses), as a fraction of the file's total column
 * count. The highest-scoring profile above a floor confidence (0.4 — at
 * least 2 of 5 columns recognized) is suggested; below that, importType is
 * null and the Admin picks manually on the Mapping page. A simple, fully
 * explainable rule — "N of your M columns matched this profile's known
 * aliases" — not a black box.
 */
export function detectImportType(columns: string[]): DetectionResult {
  const normalizedColumns = columns.map(normalize);

  const scores = IMPORT_PROFILES.map((profile) => {
    const aliasKeys = new Set(Object.keys(profile.aliases));
    const expectedKeys = new Set(profile.expectedColumns.map(normalize));
    const matches = normalizedColumns.filter(
      (column) => aliasKeys.has(column) || expectedKeys.has(column),
    ).length;
    return {
      importType: profile.importType,
      label: profile.label,
      score: normalizedColumns.length > 0 ? matches / normalizedColumns.length : 0,
    };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  const CONFIDENCE_FLOOR = 0.4;

  return {
    importType: best && best.score >= CONFIDENCE_FLOOR ? best.importType : null,
    confidence: best?.score ?? 0,
    scores,
  };
}
