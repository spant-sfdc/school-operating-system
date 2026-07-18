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
