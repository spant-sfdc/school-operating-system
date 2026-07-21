import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { StudentStatus } from "@/generated/prisma/enums";

export async function findStudentById(id: string) {
  return db.student.findUnique({ where: { id } });
}

export async function findStudentByAdmissionNumber(schoolId: string, admissionNumber: string) {
  return db.student.findUnique({
    where: { schoolId_admissionNumber: { schoolId, admissionNumber } },
  });
}

export async function listActiveStudentsBySchool(schoolId: string) {
  return db.student.findMany({
    where: { schoolId, status: "ACTIVE" },
    orderBy: { admissionNumber: "asc" },
  });
}

export async function createStudent(
  input: Prisma.StudentCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.student.create({ data: input });
}

// StudentGuardian has no dedicated repository — it isn't in this sprint's
// named repository list. Its data access lives here, on the Student side,
// since "list guardians for a student" is DATABASE_REVIEW.md § 3's
// first-listed query pattern for the join table.

export async function linkGuardianToStudent(
  input: Prisma.StudentGuardianCreateInput,
  tx: Prisma.TransactionClient = db,
) {
  return tx.studentGuardian.create({ data: input });
}

export async function listGuardiansForStudent(studentId: string) {
  return db.studentGuardian.findMany({
    where: { studentId, deletedAt: null },
    include: { guardian: true },
  });
}

// Batch form of listGuardiansForStudent() above — the Attendance Grid
// (Sprint E2) needs a guardian summary per row for up to ~40 students at
// once; one query with `studentId IN (...)`, grouped by the caller, avoids
// the N+1 that calling the single-student version per row would cause.
// Mirrors src/repositories/user/user.repository.ts's findUsersByIds()
// batch-resolution precedent.
export async function listGuardiansForStudents(studentIds: string[]) {
  if (studentIds.length === 0) return [];
  return db.studentGuardian.findMany({
    where: { studentId: { in: studentIds }, deletedAt: null },
    include: { guardian: true },
  });
}

export interface StudentSearchFilters {
  schoolId: string;
  query?: string;
  status?: StudentStatus | "ALL";
  schoolClassId?: string;
  sectionId?: string;
  // The academic year an Enrollment is filtered/displayed against — always
  // resolved by the caller (defaulting to the current year), never
  // optional by the time it reaches this query; see
  // src/services/student/studentDirectory.service.ts.
  academicYearId: string;
  sortBy?: "name" | "admissionNumber" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function buildOrderBy(
  sortBy: NonNullable<StudentSearchFilters["sortBy"]>,
  sortDir: NonNullable<StudentSearchFilters["sortDir"]>,
): Prisma.StudentOrderByWithRelationInput[] {
  switch (sortBy) {
    case "admissionNumber":
      return [{ admissionNumber: sortDir }];
    case "status":
      return [{ status: sortDir }, { firstName: "asc" }];
    case "name":
    default:
      return [{ firstName: sortDir }, { lastName: sortDir }];
  }
}

// The Student Directory (Sprint E1) — mirrors
// src/repositories/user/user.repository.ts's searchUsers() shape (same
// filter/pagination pattern, reused deliberately). Spans three tables
// (Student, Guardian via StudentGuardian, Enrollment/Section for
// class/section) rather than one flat scan, per DATABASE_REVIEW.md § 2's
// own framing of name search as a real, if modest, future need. The
// class/section filters only constrain WHICH students match; the
// `academicYearId` enrollment `include` below is unconditional — every
// row needs to know "which class/section is this student in this year,"
// separately from whether that year was used to filter the result set.
export async function searchStudents(filters: StudentSearchFilters) {
  const {
    schoolId,
    query,
    status = "ALL",
    schoolClassId,
    sectionId,
    academicYearId,
    sortBy = "name",
    sortDir = "asc",
    page = 1,
    pageSize = 20,
  } = filters;

  const where: Prisma.StudentWhereInput = {
    schoolId,
    ...(status !== "ALL" ? { status } : {}),
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { admissionNumber: { contains: query, mode: "insensitive" } },
            { udisePen: { contains: query, mode: "insensitive" } },
            {
              studentGuardians: {
                some: {
                  deletedAt: null,
                  guardian: {
                    OR: [
                      { firstName: { contains: query, mode: "insensitive" } },
                      { lastName: { contains: query, mode: "insensitive" } },
                      { phone: { contains: query, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
    ...(sectionId
      ? { enrollments: { some: { academicYearId, sectionId } } }
      : schoolClassId
        ? { enrollments: { some: { academicYearId, section: { schoolClassId } } } }
        : {}),
  };

  const [items, total] = await Promise.all([
    db.student.findMany({
      where,
      orderBy: buildOrderBy(sortBy, sortDir),
      include: {
        enrollments: {
          where: { academicYearId },
          include: { section: { include: { schoolClass: true } } },
          take: 1,
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.student.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
