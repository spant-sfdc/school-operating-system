import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { TeacherStatus } from "@/generated/prisma/enums";

export async function findTeacherById(id: string) {
  return db.teacher.findUnique({ where: { id } });
}

export async function findTeacherByUserId(userId: string) {
  return db.teacher.findUnique({ where: { userId } });
}

export async function listActiveTeachersBySchool(schoolId: string) {
  return db.teacher.findMany({
    where: { schoolId, status: "ACTIVE" },
    orderBy: { lastName: "asc" },
  });
}

export async function createTeacher(
  input: Prisma.TeacherCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.teacher.create({ data: input });
}

export async function updateTeacherStatus(
  id: string,
  status: TeacherStatus,
  tx: Prisma.TransactionClient = db,
) {
  return tx.teacher.update({ where: { id }, data: { status } });
}
