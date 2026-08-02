import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission, canManagePromotions } from "@/lib/authorization";
import { getPromotionReviewWorkspace } from "@/services/promotion/promotionReviewWorkspace.service";
import { listSchoolClassesBySchool } from "@/repositories/schoolClass";
import { listSectionsBySchoolAndYear } from "@/repositories/section";
import PromotionReviewGrid from "@/app/admin/promotions/[schoolClassId]/[sectionId]/PromotionReviewGrid";

// Promotion Review Workspace (Sprint E11) — one section's students, each
// row showing this year's published academic results, a (always
// currently "Manual Review Required") recommendation, and either an
// editable decision or an already-finalized read-only summary. A Server
// Component resolves and authorizes the workspace
// (getPromotionReviewWorkspace()) and every target-year class/section
// option up front, handing off to one Client Component
// (PromotionReviewGrid.tsx) for the actual interactive decision-recording
// — mirrors MarksEntryPage's own Server-Component-loads/Client-Component-edits
// shape exactly.
export default async function PromotionReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolClassId: string; sectionId: string }>;
  searchParams: Promise<{ sourceYear?: string; targetYear?: string }>;
}) {
  const session = await requirePermission(canManagePromotions);
  const [{ schoolClassId, sectionId }, { sourceYear, targetYear }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!sourceYear) {
    notFound();
  }

  const workspace = await getPromotionReviewWorkspace(
    sourceYear,
    schoolClassId,
    sectionId,
    session.schoolId,
  );
  if (!workspace) {
    notFound();
  }

  const [targetSchoolClasses, targetSections] = await Promise.all([
    listSchoolClassesBySchool(session.schoolId),
    targetYear ? listSectionsBySchoolAndYear(session.schoolId, targetYear) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="mb-2">
        <Link href="/admin/promotions" className="text-primary text-sm underline">
          ← Promotion Home
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {workspace.schoolClassName} - {workspace.sectionName}
        </h1>
        <span className="text-muted-foreground text-sm">{workspace.sourceAcademicYearLabel}</span>
      </div>

      <PromotionReviewGrid
        rows={workspace.rows}
        sourceSchoolClassId={workspace.schoolClassId}
        targetAcademicYearId={targetYear ?? null}
        targetSchoolClasses={targetSchoolClasses.map((c) => ({ id: c.id, name: c.name }))}
        targetSections={targetSections.map((s) => ({
          id: s.id,
          name: s.name,
          schoolClassId: s.schoolClassId,
        }))}
      />
    </main>
  );
}
