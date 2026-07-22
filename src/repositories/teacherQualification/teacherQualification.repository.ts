import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findTeacherQualificationById(id: string) {
  return db.teacherQualification.findUnique({ where: { id } });
}

export async function listQualificationsForTeacher(teacherId: string) {
  return db.teacherQualification.findMany({
    where: { teacherId, deletedAt: null },
    orderBy: { yearCompleted: "asc" },
  });
}

export async function createTeacherQualification(
  input: Prisma.TeacherQualificationCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.teacherQualification.create({ data: input });
}

// Powers the Teacher Directory's own Qualification filter dropdown —
// qualificationType is a free string (every registration names its own,
// e.g. "B.Ed", "M.A."), not a schema enum, so the real, currently-occurring
// set is queried directly rather than hardcoded. Mirrors
// src/repositories/auditLog/auditLog.repository.ts's own
// listDistinctEntityTypes() precedent exactly, joined through
// TeacherQualification's own `teacher` relation since this model carries
// no `schoolId` of its own (scoped transitively via Teacher, the same
// convention Section uses via SchoolClass — see D-051's own
// listSectionsBySchoolAndYear() comment).
export async function listDistinctQualificationTypes(schoolId: string): Promise<string[]> {
  const rows = await db.teacherQualification.findMany({
    where: { deletedAt: null, teacher: { schoolId } },
    select: { qualificationType: true },
    distinct: ["qualificationType"],
    orderBy: { qualificationType: "asc" },
  });
  return rows.map((row) => row.qualificationType);
}
