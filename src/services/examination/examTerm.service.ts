import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/db-utils";
import {
  createExamTerm as createExamTermRow,
  findExamTermById,
  deactivateExamTerm as deactivateExamTermRow,
  listExamTermsByAcademicYear as listExamTermsByAcademicYearRows,
} from "@/repositories/examTerm";
import { countExaminationsByExamTerm } from "@/repositories/examination";
import {
  createExamTermInputSchema,
  deactivateExamTermInputSchema,
  type CreateExamTermInput,
  type DeactivateExamTermInput,
} from "@/lib/validations/examination";
import { toExamTermDTO, type ExamTermDTO } from "@/services/examination/dto/examTerm.dto";

/**
 * Creates an ExamTerm — the configurable examination period ("Unit Test 1",
 * "Half-Yearly", "Annual", a school's own custom name) that Examinations
 * schedule against. Per DOMAIN_MODEL.md § 8.1, term structure genuinely
 * varies school to school and year to year — `name` is never hardcoded or
 * enum-constrained, matching BUSINESS_RULES.md § 5's own "no specific
 * grading/term scheme is assumed universal" principle.
 *
 * Optional `tx`, the same passthrough pattern every write in this codebase
 * uses (see docs/DECISIONS.md's Sprint D2 entry) — so a future Examination
 * importer's own commit handler can call this inside its own per-row
 * transaction, exactly like createSchoolClassWithSections() already
 * supports for Academic Structure.
 */
export async function createExamTerm(
  input: CreateExamTermInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExamTermDTO> {
  const validated = createExamTermInputSchema.parse(input);

  const run = async (t: Prisma.TransactionClient) => {
    const examTerm = await createExamTermRow(
      {
        name: validated.name,
        sortOrder: validated.sortOrder,
        weightagePercent: validated.weightagePercent,
        school: { connect: { schoolId: validated.schoolId } },
        academicYear: { connect: { id: validated.academicYearId } },
      },
      t,
    );

    await writeAuditLog(t, {
      schoolId: validated.schoolId,
      entityType: "ExamTerm",
      entityId: examTerm.id,
      actorUserId,
      action: "CREATE",
      afterValue: { name: examTerm.name, sortOrder: examTerm.sortOrder },
    });

    return toExamTermDTO(examTerm);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Deactivates (soft-deletes) an ExamTerm — guarded by
 * countExaminationsByExamTerm() (examination.repository.ts), composed here
 * rather than imported cross-repository, per DOMAIN_MODEL.md § 8.1's own
 * "Soft delete: Yes, once no Examination remains scheduled against it"
 * rule.
 */
export async function deactivateExamTerm(
  input: DeactivateExamTermInput,
  actorUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<ExamTermDTO> {
  const validated = deactivateExamTermInputSchema.parse(input);

  const existing = await findExamTermById(validated.examTermId);
  if (!existing) {
    throw new Error(`Exam term not found: ${validated.examTermId}`);
  }
  if (existing.deletedAt) {
    throw new Error("This exam term is already inactive.");
  }

  const examinationCount = await countExaminationsByExamTerm(validated.examTermId);
  if (examinationCount > 0) {
    throw new Error(
      `Cannot deactivate this exam term — ${examinationCount} examination(s) are still scheduled against it.`,
    );
  }

  const run = async (t: Prisma.TransactionClient) => {
    const updated = await deactivateExamTermRow(validated.examTermId, t);

    await writeAuditLog(t, {
      schoolId: existing.schoolId,
      entityType: "ExamTerm",
      entityId: existing.id,
      actorUserId,
      action: "SOFT_DELETE",
      beforeValue: { deletedAt: null },
      afterValue: { deletedAt: updated.deletedAt },
    });

    return toExamTermDTO(updated);
  };

  return tx ? run(tx) : db.$transaction(run);
}

/**
 * Lists every active ExamTerm for an AcademicYear, ordered by
 * `sortOrder` — the read Sprint E8 (Marks Entry) and any future
 * Examination Setup UI will consume to populate a term picker.
 */
export async function listExamTermsByAcademicYear(academicYearId: string): Promise<ExamTermDTO[]> {
  const examTerms = await listExamTermsByAcademicYearRows(academicYearId);
  return examTerms.map(toExamTermDTO);
}
