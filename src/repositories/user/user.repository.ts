import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findUserById(id: string) {
  return db.user.findUnique({ where: { id }, include: { role: true } });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email }, include: { role: true } });
}

export async function listUsersBySchool(schoolId: string) {
  return db.user.findMany({
    where: { schoolId, deactivatedAt: null },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createUser(input: Prisma.UserCreateInput, tx: Prisma.TransactionClient = db) {
  return tx.user.create({ data: input, include: { role: true } });
}

export async function updateUser(
  id: string,
  input: Prisma.UserUpdateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.user.update({ where: { id }, data: input, include: { role: true } });
}

export async function deactivateUser(id: string, tx: Prisma.TransactionClient = db) {
  return tx.user.update({ where: { id }, data: { deactivatedAt: new Date() } });
}
