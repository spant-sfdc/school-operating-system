import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { TeacherStatus } from "@/generated/prisma/enums";

export async function findTeacherById(id: string) {
  return db.teacher.findUnique({ where: { id } });
}

// The Admin Teacher 360's own read — Identity/Account/Assignments/
// Qualifications composed in one call, mirroring
// src/repositories/user/user.repository.ts's findUserById()+include:role
// shape (Sprint E5). Deliberately its own function, not a parameter
// bolted onto findTeacherById() above — that function's callers (teacher
// registration/assignment/deactivation) never needed the User relation,
// and adding it there would mean every existing caller pays for an unused
// join.
export async function findTeacherWithUserById(id: string) {
  return db.teacher.findUnique({ where: { id }, include: { user: { include: { role: true } } } });
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

// Sprint E5's own "Edit" Quick Action — every field here is independently
// optional, matching editTeacherProfileInputSchema's partial-update shape
// (src/lib/validations/teacher.ts); `status` is deliberately excluded —
// that lifecycle transition stays behind updateTeacherStatus() above/
// reactivateTeacher()/deactivateTeacher(), never silently bundled into a
// profile edit.
export async function updateTeacherProfile(
  id: string,
  input: Pick<
    Prisma.TeacherUpdateInput,
    "firstName" | "lastName" | "phone" | "gender" | "dateOfBirth" | "photoUrl"
  >,
  tx: Prisma.TransactionClient = db,
) {
  return tx.teacher.update({ where: { id }, data: input });
}

export interface TeacherSearchFilters {
  schoolId: string;
  // Spans name, email (via the User relation), the Teacher's own id (the
  // Directory's stand-in "Employee ID" search field — see D-052; no
  // distinct employeeId column exists), subject name, qualification type,
  // class name, and section name — mirroring
  // src/repositories/student/student.repository.ts's searchStudents(),
  // which spans an equally wide set of related tables for the same reason
  // (one search box, several plausible ways to look someone up).
  query?: string;
  status?: TeacherStatus | "ALL";
  classTeacherOnly?: boolean;
  subjectTeacherOnly?: boolean;
  qualificationType?: string;
  schoolClassId?: string;
  sectionId?: string;
  // Every assignment-shaped filter/search clause below is scoped to this
  // year — a teacher's Directory row reflects "who teaches what this
  // year," not their entire multi-year history (that's Teacher 360's own
  // Historical Assignments section, via listAssignmentHistoryForTeacher()
  // below).
  academicYearId: string;
  sortBy?: "name" | "status" | "recent";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function buildTeacherOrderBy(
  sortBy: NonNullable<TeacherSearchFilters["sortBy"]>,
  sortDir: NonNullable<TeacherSearchFilters["sortDir"]>,
): Prisma.TeacherOrderByWithRelationInput[] {
  switch (sortBy) {
    case "status":
      return [{ status: sortDir }, { firstName: "asc" }];
    case "recent":
      return [{ createdAt: "desc" }];
    case "name":
    default:
      return [{ firstName: sortDir }, { lastName: sortDir }];
  }
}

// Teacher Directory (Sprint E5) — mirrors searchStudents()'s own shape and
// pagination/sort conventions exactly (same file's own precedent), applied
// to the Teacher aggregate: Teacher + User (email) + TeacherAssignment
// (current-year subject/class/section, Class/Subject Teacher badges) +
// TeacherQualification. Not a literal call into searchStudents() — Teacher
// and Student are different aggregates with no shared table — the
// *convention* is reused, not the function (see D-052's own Architecture
// Review answer to "Can Teacher Directory reuse Student Directory?").
export async function searchTeachers(filters: TeacherSearchFilters) {
  const {
    schoolId,
    query,
    status = "ALL",
    classTeacherOnly,
    subjectTeacherOnly,
    qualificationType,
    schoolClassId,
    sectionId,
    academicYearId,
    sortBy = "name",
    sortDir = "asc",
    page = 1,
    pageSize = 20,
  } = filters;

  const assignmentScope = { deletedAt: null, academicYearId } as const;

  const where: Prisma.TeacherWhereInput = {
    schoolId,
    ...(status !== "ALL" ? { status } : {}),
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { id: { equals: query } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            {
              qualifications: {
                some: {
                  deletedAt: null,
                  qualificationType: { contains: query, mode: "insensitive" },
                },
              },
            },
            {
              assignments: {
                some: {
                  ...assignmentScope,
                  OR: [
                    { subject: { name: { contains: query, mode: "insensitive" } } },
                    { section: { name: { contains: query, mode: "insensitive" } } },
                    {
                      section: { schoolClass: { name: { contains: query, mode: "insensitive" } } },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {}),
    ...(classTeacherOnly
      ? { assignments: { some: { ...assignmentScope, isClassTeacher: true } } }
      : {}),
    ...(subjectTeacherOnly
      ? { assignments: { some: { ...assignmentScope, isClassTeacher: false } } }
      : {}),
    ...(qualificationType
      ? { qualifications: { some: { deletedAt: null, qualificationType } } }
      : {}),
    ...(sectionId
      ? { assignments: { some: { ...assignmentScope, sectionId } } }
      : schoolClassId
        ? { assignments: { some: { ...assignmentScope, section: { schoolClassId } } } }
        : {}),
  };

  const include = {
    user: { include: { role: true } },
    assignments: {
      where: assignmentScope,
      include: { section: { include: { schoolClass: true } }, subject: true },
    },
    qualifications: { where: { deletedAt: null } },
  } satisfies Prisma.TeacherInclude;

  const [items, total] = await Promise.all([
    db.teacher.findMany({
      where,
      orderBy: buildTeacherOrderBy(sortBy, sortDir),
      include,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.teacher.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
