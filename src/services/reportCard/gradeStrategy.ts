import type { GradeScaleType } from "@/generated/prisma/enums";
import type { GradeBandInput } from "@/lib/validations/examination";

/**
 * Resolves a grade letter from a percentage against a GradeScale's own
 * bands — Sprint E12's own answer to Sprint E10's named gap (Q6/Q7).
 * `type === "MARKS_BASED"` is an explicit, nameable "this class reports
 * marks only" declaration (D-053's own precedent) — returns `null`,
 * never a fabricated grade. Bands are percent-denominated
 * (`{ minPercent, maxPercent, grade }`, per the schema's own
 * `GradeScale.bands` comment) — grade lookup therefore always happens
 * against a percentage, never raw marks (Q7's own answer), so the same
 * function applies identically to one subject's own percentage or the
 * report card's overall percentage.
 */
export function resolveGrade(
  gradeScaleType: GradeScaleType | null,
  bands: GradeBandInput[] | null,
  percentage: number,
): string | null {
  if (!gradeScaleType || gradeScaleType === "MARKS_BASED" || !bands || bands.length === 0) {
    return null;
  }
  const band = bands.find((b) => percentage >= b.minPercent && percentage <= b.maxPercent);
  return band?.grade ?? null;
}
