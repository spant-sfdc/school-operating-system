import type { DataProfile } from "@/services/import/profiling";

/**
 * The Import Health Summary — the one reusable structure this sprint's own
 * "Data Profiling" section asks for, built on top of Sprint D2's
 * buildDataProfile() rather than replacing it. A deterministic Quality
 * Score (0-100), not a magic AI confidence number: starts at 100 and
 * subtracts a fixed penalty per category of problem, floored at 0 —
 * simple enough for an Admin to trust ("why is my score 70? two
 * categories of issue, 15 points each"), not a black box.
 */
export interface ImportHealthSummary {
  qualityScore: number;
  summaryLabel: "Excellent" | "Good" | "Needs Review" | "Poor";
  totalRows: number;
  duplicateRows: number;
  totalMissingValues: number;
  totalUnknownValues: number;
  warnings: string[];
  errors: string[];
}

function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

export function buildImportHealthSummary(profile: DataProfile): ImportHealthSummary {
  const totalMissingValues = sumCounts(profile.missingValueCounts);
  const totalUnknownValues = sumCounts(profile.unknownValueCounts);

  let score = 100;
  if (profile.totalRows === 0) score -= 100;
  if (profile.duplicateRows > 0) score -= 15;
  if (totalMissingValues > 0) score -= 20;
  if (totalUnknownValues > 0) score -= 15;
  if (profile.errors.length > 0) score -= 50;
  score = Math.max(0, score);

  const summaryLabel: ImportHealthSummary["summaryLabel"] =
    score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 40 ? "Needs Review" : "Poor";

  return {
    qualityScore: score,
    summaryLabel,
    totalRows: profile.totalRows,
    duplicateRows: profile.duplicateRows,
    totalMissingValues,
    totalUnknownValues,
    warnings: profile.warnings,
    errors: profile.errors,
  };
}
