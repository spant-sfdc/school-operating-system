import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function findRoleById(id: string) {
  return db.role.findUnique({ where: { id } });
}

export async function findRoleByName(name: string) {
  return db.role.findUnique({ where: { name } });
}

export async function listRoles() {
  return db.role.findMany({ orderBy: { name: "asc" } });
}

export async function createRole(input: Prisma.RoleCreateInput, tx: Prisma.TransactionClient = db) {
  return tx.role.create({ data: input });
}
