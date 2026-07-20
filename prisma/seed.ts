// Runs standalone via `tsx` (see prisma.config.ts's `migrations.seed`), not
// through Next.js's build pipeline — load .env.local/.env explicitly rather
// than relying on Next's auto-loading, which doesn't apply here.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { SCHOOL } from "../src/config/school";

// Indian schools' academic year runs April–March; used here as the seed's
// current-year window since src/config/school.ts's `academicSession` is
// still an unconfirmed placeholder — see docs/PRODUCT_REQUIREMENTS.md § 11
// Open Product Questions. Replace with the real session once School Admin
// confirms it.
function currentAcademicYearWindow(now = new Date()) {
  const aprilIndex = 3; // Date months are 0-indexed
  const startYear = now.getMonth() >= aprilIndex ? now.getFullYear() : now.getFullYear() - 1;
  const startDate = new Date(Date.UTC(startYear, aprilIndex, 1));
  const endDate = new Date(Date.UTC(startYear + 1, aprilIndex, 0));
  const label = `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
  return { label, startDate, endDate };
}

// Generic Nursery–Class 8 progression — a real, well-established Indian
// schooling convention (docs/domain/DOMAIN_MODEL.md § 3.2), not a fact
// specific to Pant Public School. Index doubles as `sortOrder`; ordinal,
// not assumed alphabetical, per DOMAIN_MODEL.md § 3.2's own note.
const GENERIC_CLASS_NAMES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
];

const GENERIC_SECTION_NAMES = ["A", "B"];

// Common, generic Indian K-8 school subjects (docs/domain/DOMAIN_MODEL.md
// § 3.4's own examples) — not Pant-Public-School-specific.
const GENERIC_SUBJECT_NAMES = [
  "English",
  "Hindi",
  "Mathematics",
  "Environmental Studies",
  "Science",
  "Social Studies",
  "Computer Science",
  "Art & Craft",
  "Physical Education",
  "General Knowledge",
];

// No real User exists yet (Sprint 1 seeds roles only, never users) —
// AuditLog.actorUserId has no FK constraint (Migration 000 predates User by
// design), so a plain sentinel string is safe here.
const SEED_ACTOR_USER_ID = "system-seed";

// Reference data (Role rows, School/AcademicYear, Bootstrap Administrator)
// always seeds — every deployment needs it. The generic Nursery-8
// classes/sections/subjects/guardians/students/teachers/attendance below are
// this repository's own development fixtures, not client data — per
// docs/product/CLIENT_IMPLEMENTATION_PLAYBOOK.md § 2.1 step 5's explicit
// "reference-data only" instruction and
// docs/product/CLIENT_CUSTOMIZATION_GUIDE.md § 2 item 11, a real client
// deployment's seed run must skip them. Set SEED_DEV_FIXTURES=false in that
// deployment's environment before running this script; defaults to included
// (true) so this repository's own dev/CI seeding is unaffected.
const SEED_DEV_FIXTURES = process.env.SEED_DEV_FIXTURES !== "false";

// Bootstrap Administrator — the one account created without ever going
// through Admin-driven provisioning, because no Admin exists yet to
// provision it. See docs/product/ADMINISTRATION_STRATEGY.md § 5 and
// docs/development/DEVELOPMENT_LOGIN.md for the full explanation and how to
// change these credentials after first login. Named constants (Sprint B2,
// per this sprint's own "review for hardcoded values" instruction) —
// previously inline string literals. `.invalid` is IANA's reserved TLD for
// addresses that must never resolve (RFC 2606) — the same "obviously fake,
// never a real domain" discipline this project already applies to every
// other generic seed email (@example.com in Sprint 4).
//
// Overridden by BOOTSTRAP_ADMIN_EMAIL/PASSWORD/NAME at deployment time for
// a real client — see docs/product/ADMINISTRATION_STRATEGY.md § 5's
// env-var-driven bootstrap script design. These fallback constants are
// **never a production secret** — see DEVELOPMENT_LOGIN.md's own warning.
const DEFAULT_BOOTSTRAP_ADMIN_EMAIL = "bootstrap-admin@school.invalid";
const DEFAULT_BOOTSTRAP_ADMIN_PASSWORD = "ChangeMeImmediately123!";
const DEFAULT_BOOTSTRAP_ADMIN_NAME = "Bootstrap Administrator";

// Minimal generic sample data for Sprint 3 — Student Foundation. Common,
// generic Indian names (equivalent in genericness to "John Smith"),
// deliberately not modeled on any real person, consistent with the same
// discipline the public site's own content applies to real facts about
// Pant Public School specifically (this is seed/test data, not public
// content, but the "never fabricate a specific real identity" spirit still
// applies). Guardians are shared across siblings, matching a real family
// structure and keeping the total at exactly 3, per this sprint's
// instruction.
const GENERIC_GUARDIAN_SEEDS = [
  { firstName: "Ramesh", lastName: "Kumar", phone: "9800000001" },
  { firstName: "Sunita", lastName: "Sharma", phone: "9800000002" },
  { firstName: "Vijay", lastName: "Singh", phone: "9800000003" },
] as const;

const GENERIC_STUDENT_SEEDS = [
  {
    admissionNumber: "STU-0001",
    firstName: "Aarav",
    lastName: "Kumar",
    dateOfBirth: "2019-08-15",
    className: "Class 1",
    sectionName: "A",
    rollNumber: "1",
    guardianPhone: "9800000001",
    relationshipType: "FATHER" as const,
  },
  {
    admissionNumber: "STU-0002",
    firstName: "Diya",
    lastName: "Kumar",
    dateOfBirth: "2017-03-22",
    className: "Class 3",
    sectionName: "A",
    rollNumber: "1",
    guardianPhone: "9800000001",
    relationshipType: "FATHER" as const,
  },
  {
    admissionNumber: "STU-0003",
    firstName: "Ishaan",
    lastName: "Sharma",
    dateOfBirth: "2022-11-05",
    className: "Nursery",
    sectionName: "A",
    rollNumber: "1",
    guardianPhone: "9800000002",
    relationshipType: "MOTHER" as const,
  },
  {
    admissionNumber: "STU-0004",
    firstName: "Ananya",
    lastName: "Singh",
    dateOfBirth: "2015-06-30",
    className: "Class 5",
    sectionName: "A",
    rollNumber: "1",
    guardianPhone: "9800000003",
    relationshipType: "FATHER" as const,
  },
  {
    admissionNumber: "STU-0005",
    firstName: "Kabir",
    lastName: "Singh",
    dateOfBirth: "2016-01-10",
    className: "Class 5",
    sectionName: "A",
    rollNumber: "2",
    guardianPhone: "9800000003",
    relationshipType: "FATHER" as const,
  },
] as const;

// Sprint 4 — Teacher Foundation. Generic sample data, never
// Pant-Public-School-specific — same discipline as the guardian/student
// seeds above. Emails use example.com, IANA's reserved
// documentation/example domain (RFC 2606) — deliberately not a fabricated
// real address.
const GENERIC_TEACHER_SEEDS = [
  {
    email: "meera.joshi@example.com",
    firstName: "Meera",
    lastName: "Joshi",
    phone: "9900000001",
    qualifications: [
      { qualificationType: "B.Ed", institution: "State University", yearCompleted: 2015 },
      { qualificationType: "TET" },
    ],
    assignments: [
      { className: "Class 1", sectionName: "A", isClassTeacher: true as const },
      { className: "Class 1", sectionName: "A", subjectName: "Mathematics" },
    ],
  },
  {
    email: "arjun.nair@example.com",
    firstName: "Arjun",
    lastName: "Nair",
    phone: "9900000002",
    qualifications: [
      { qualificationType: "B.Ed", institution: "State University", yearCompleted: 2012 },
    ],
    assignments: [
      { className: "Class 3", sectionName: "A", subjectName: "English" },
      { className: "Class 5", sectionName: "A", subjectName: "English" },
    ],
  },
  {
    email: "priya.reddy@example.com",
    firstName: "Priya",
    lastName: "Reddy",
    phone: "9900000003",
    qualifications: [
      { qualificationType: "M.Ed", institution: "State University", yearCompleted: 2018 },
      { qualificationType: "B.Ed", institution: "State University", yearCompleted: 2016 },
    ],
    assignments: [
      { className: "Class 5", sectionName: "A", isClassTeacher: true as const },
      { className: "Class 5", sectionName: "A", subjectName: "Science" },
    ],
  },
] as const;

async function main() {
  // Dynamic imports, not static ones: these transitively import
  // src/lib/db → src/lib/env, which parses process.env at module
  // evaluation time. ESM hoists static imports ahead of this file's own
  // loadEnv() calls above, so a static import here would evaluate env.ts
  // before dotenv has run. Deferring to dynamic imports (evaluated when
  // this line actually executes, not at module load) avoids that ordering
  // trap while still routing every write through the repository/service
  // layer, not raw Prisma.
  const { upsertSchool } = await import("../src/repositories/school");
  const { upsertAcademicYear } = await import("../src/repositories/academicYear");
  const { createRole, findRoleByName } = await import("../src/repositories/role");
  const { findSchoolClassByName } = await import("../src/repositories/schoolClass");
  const { findSubjectByName } = await import("../src/repositories/subject");
  const { createSchoolClassWithSections, createAcademicSubject } =
    await import("../src/services/academic");

  const school = await upsertSchool("seed-school", {
    schoolId: "seed-school",
    name: SCHOOL.name,
    shortName: SCHOOL.shortName,
    // affiliationBoard/udiseCode intentionally left null — SCHOOL.affiliation
    // is still an unconfirmed bracketed placeholder, not a real value to store.
  });

  const { label, startDate, endDate } = currentAcademicYearWindow();

  const academicYear = await upsertAcademicYear(school.schoolId, label, {
    label,
    startDate,
    endDate,
    isCurrent: true,
    // Not yet confirmed by School Admin — see docs/PRODUCT_REQUIREMENTS.md
    // § 11 Open Product Questions ("Examination grading model" /
    // "Academic year start month and term structure"). A real policy value
    // must replace this before promotion logic (Migration 010) depends on it.
    promotionPolicy: {
      configured: false,
      note: "Pending School Admin confirmation — see docs/PRODUCT_REQUIREMENTS.md § 11",
    },
    school: { connect: { schoolId: school.schoolId } },
  });

  console.log(`Seeded school "${school.name}" with academic year ${label}.`);

  // Sprint 1 — Identity Foundation. Roles only, no users — see
  // docs/DECISIONS.md's Sprint 1 entry: "Administrator" and "Principal" are
  // two distinct job-title Role rows that both grant ADMIN-tier access,
  // matching PROJECT_CONTEXT.md § 4's "Admin: Principal / Management /
  // School Office" framing rather than introducing a fourth permission tier.
  const roleSeeds = [
    { name: "Administrator", accessLevel: "ADMIN" as const },
    { name: "Principal", accessLevel: "ADMIN" as const },
    { name: "Teacher", accessLevel: "TEACHER" as const },
  ];

  for (const roleSeed of roleSeeds) {
    const existing = await findRoleByName(roleSeed.name);
    if (existing) continue;
    await createRole(roleSeed);
  }

  console.log(`Seeded roles: ${roleSeeds.map((r) => r.name).join(", ")}.`);

  // Hoisted above the SEED_DEV_FIXTURES gate below — the Bootstrap
  // Administrator block near the end of this script also needs it, and a
  // `const` declared inside that gated block would otherwise be invisible
  // there once the fixtures below become conditional.
  const { findUserByEmail } = await import("../src/repositories/user");

  if (!SEED_DEV_FIXTURES) {
    console.log(
      "SEED_DEV_FIXTURES=false — skipping generic classes/subjects/guardians/students/teachers/attendance (this repository's own development fixtures, not client data).",
    );
  } else {
    // Sprint 2 — Academic Foundation. Classes + sections + subjects only, all
    // generic (see the constants above) — never Pant-Public-School-specific.
    for (let index = 0; index < GENERIC_CLASS_NAMES.length; index++) {
      const className = GENERIC_CLASS_NAMES[index];
      const existing = await findSchoolClassByName(school.schoolId, className);
      if (existing) continue;
      await createSchoolClassWithSections(
        {
          schoolId: school.schoolId,
          academicYearId: academicYear.id,
          className,
          sortOrder: index,
          sectionNames: GENERIC_SECTION_NAMES,
        },
        SEED_ACTOR_USER_ID,
      );
    }

    console.log(
      `Seeded ${GENERIC_CLASS_NAMES.length} classes, each with sections: ${GENERIC_SECTION_NAMES.join(", ")}.`,
    );

    for (const name of GENERIC_SUBJECT_NAMES) {
      const existing = await findSubjectByName(school.schoolId, name);
      if (existing) continue;
      await createAcademicSubject({ schoolId: school.schoolId, name }, SEED_ACTOR_USER_ID);
    }

    console.log(`Seeded subjects: ${GENERIC_SUBJECT_NAMES.join(", ")}.`);

    // Sprint 3 — Student Foundation. Guardians resolved (not re-created) by
    // phone before each student, so siblings correctly share one Guardian
    // row and re-running this script stays idempotent.
    const { findGuardiansByPhone, createGuardian } = await import("../src/repositories/guardian");
    const { findStudentByAdmissionNumber } = await import("../src/repositories/student");
    const { listSectionsByClassAndYear } = await import("../src/repositories/section");
    const { findEnrollmentByStudentAndYear } = await import("../src/repositories/enrollment");
    const { registerStudent, enrollStudent } = await import("../src/services/student");

    const guardianIdByPhone = new Map<string, string>();
    for (const guardianSeed of GENERIC_GUARDIAN_SEEDS) {
      const [existing] = await findGuardiansByPhone(school.schoolId, guardianSeed.phone);
      const guardian =
        existing ??
        (await createGuardian({
          firstName: guardianSeed.firstName,
          lastName: guardianSeed.lastName,
          phone: guardianSeed.phone,
          school: { connect: { schoolId: school.schoolId } },
        }));
      guardianIdByPhone.set(guardianSeed.phone, guardian.id);
    }

    console.log(
      `Seeded guardians: ${GENERIC_GUARDIAN_SEEDS.map((g) => `${g.firstName} ${g.lastName}`).join(", ")}.`,
    );

    for (const studentSeed of GENERIC_STUDENT_SEEDS) {
      let student = await findStudentByAdmissionNumber(
        school.schoolId,
        studentSeed.admissionNumber,
      );

      if (!student) {
        const guardianId = guardianIdByPhone.get(studentSeed.guardianPhone);
        if (!guardianId)
          throw new Error(`No seeded guardian for phone ${studentSeed.guardianPhone}`);

        const dto = await registerStudent(
          {
            schoolId: school.schoolId,
            firstName: studentSeed.firstName,
            lastName: studentSeed.lastName,
            dateOfBirth: new Date(studentSeed.dateOfBirth),
            admissionNumber: studentSeed.admissionNumber,
            guardians: [
              {
                guardianId,
                relationshipType: studentSeed.relationshipType,
                isPrimaryContact: true,
                isAuthorizedForPickup: true,
              },
            ],
          },
          SEED_ACTOR_USER_ID,
        );
        student = await findStudentByAdmissionNumber(school.schoolId, dto.admissionNumber);
      }

      if (!student)
        throw new Error(`Failed to resolve seeded student ${studentSeed.admissionNumber}`);

      const alreadyEnrolled = await findEnrollmentByStudentAndYear(student.id, academicYear.id);
      if (alreadyEnrolled) continue;

      const schoolClass = await findSchoolClassByName(school.schoolId, studentSeed.className);
      if (!schoolClass) throw new Error(`Seeded class not found: ${studentSeed.className}`);

      const sections = await listSectionsByClassAndYear(schoolClass.id, academicYear.id);
      const section = sections.find((s) => s.name === studentSeed.sectionName);
      if (!section)
        throw new Error(
          `Seeded section not found: ${studentSeed.className}-${studentSeed.sectionName}`,
        );

      await enrollStudent(
        {
          studentId: student.id,
          academicYearId: academicYear.id,
          sectionId: section.id,
          rollNumber: studentSeed.rollNumber,
        },
        SEED_ACTOR_USER_ID,
      );
    }

    console.log(
      `Seeded ${GENERIC_STUDENT_SEEDS.length} students, each enrolled into ${label}'s academic structure.`,
    );

    // Sprint 4 — Teacher Foundation.
    const { findTeacherByUserId } = await import("../src/repositories/teacher");
    const { listAssignmentsForSection } = await import("../src/repositories/teacherAssignment");
    const { registerTeacher, assignTeacher } = await import("../src/services/teacher");

    const teacherRole = await findRoleByName("Teacher");
    if (!teacherRole) throw new Error("Expected the Teacher role to already be seeded.");

    for (const teacherSeed of GENERIC_TEACHER_SEEDS) {
      const existingUser = await findUserByEmail(teacherSeed.email);
      let teacher = existingUser ? await findTeacherByUserId(existingUser.id) : null;

      if (!teacher) {
        await registerTeacher(
          {
            schoolId: school.schoolId,
            roleId: teacherRole.id,
            email: teacherSeed.email,
            firstName: teacherSeed.firstName,
            lastName: teacherSeed.lastName,
            phone: teacherSeed.phone,
            qualifications: teacherSeed.qualifications.map((q) => ({ ...q })),
          },
          SEED_ACTOR_USER_ID,
        );
        const newUser = await findUserByEmail(teacherSeed.email);
        teacher = newUser ? await findTeacherByUserId(newUser.id) : null;
      }

      if (!teacher) throw new Error(`Failed to resolve seeded teacher ${teacherSeed.email}`);

      for (const assignmentSeed of teacherSeed.assignments) {
        const schoolClass = await findSchoolClassByName(school.schoolId, assignmentSeed.className);
        if (!schoolClass) throw new Error(`Seeded class not found: ${assignmentSeed.className}`);

        const sections = await listSectionsByClassAndYear(schoolClass.id, academicYear.id);
        const section = sections.find((s) => s.name === assignmentSeed.sectionName);
        if (!section) {
          throw new Error(
            `Seeded section not found: ${assignmentSeed.className}-${assignmentSeed.sectionName}`,
          );
        }

        const existingSectionAssignments = await listAssignmentsForSection(
          section.id,
          academicYear.id,
        );
        const isClassTeacher = "isClassTeacher" in assignmentSeed && assignmentSeed.isClassTeacher;
        const subjectName =
          "subjectName" in assignmentSeed ? assignmentSeed.subjectName : undefined;

        const alreadyAssigned = existingSectionAssignments.some((a) =>
          isClassTeacher
            ? a.isClassTeacher && a.teacherId === teacher.id
            : a.subject?.name === subjectName && a.teacherId === teacher.id,
        );
        if (alreadyAssigned) continue;

        const subject = subjectName ? await findSubjectByName(school.schoolId, subjectName) : null;
        if (subjectName && !subject) throw new Error(`Seeded subject not found: ${subjectName}`);

        await assignTeacher(
          {
            teacherId: teacher.id,
            academicYearId: academicYear.id,
            sectionId: section.id,
            subjectId: subject?.id,
            isClassTeacher: Boolean(isClassTeacher),
          },
          SEED_ACTOR_USER_ID,
        );
      }
    }

    console.log(
      `Seeded ${GENERIC_TEACHER_SEEDS.length} teachers with qualifications and assignments.`,
    );

    // Sprint 5 — Attendance Engine. One AttendanceSession, for Class 5-A —
    // the section with an already-seeded Class Teacher (Priya Reddy), the
    // realistic person to be marking her own section's daily attendance.
    // Sprint 3 seeded exactly 5 students total, spread across 4 different
    // sections (Class 1-A, Class 3-A, Nursery-A, Class 5-A), with at most 2
    // students in any single section — Class 5-A's own real roster is 2
    // students (Ananya Singh, Kabir Singh), not 5. Marking all 5 of Sprint
    // 3's students in one session isn't possible without either violating
    // this sprint's own "AttendanceRecord belongs to an Enrollment in the
    // session's section" business rule, or fabricating enrollments outside
    // this sprint's explicit Attendance-only scope — this seed marks exactly
    // the students who are genuinely enrolled in the one session's section,
    // consistent with every prior sprint's "generic, never fabricated" seed
    // discipline.
    const { listEnrollmentsBySection } = await import("../src/repositories/enrollment");
    const { openAttendanceSession, submitAttendance } = await import("../src/services/attendance");

    const attendanceClass = await findSchoolClassByName(school.schoolId, "Class 5");
    if (!attendanceClass) throw new Error("Seeded class not found: Class 5");

    const attendanceSections = await listSectionsByClassAndYear(
      attendanceClass.id,
      academicYear.id,
    );
    const attendanceSection = attendanceSections.find((s) => s.name === "A");
    if (!attendanceSection) throw new Error("Seeded section not found: Class 5-A");

    const classTeacherUser = await findUserByEmail("priya.reddy@example.com");
    if (!classTeacherUser) {
      throw new Error("Expected seeded teacher priya.reddy@example.com to already exist.");
    }

    const attendanceEnrollments = await listEnrollmentsBySection(
      attendanceSection.id,
      academicYear.id,
    );

    const today = new Date();
    const attendanceDate = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );

    const session = await openAttendanceSession(
      {
        sectionId: attendanceSection.id,
        date: attendanceDate,
        markedByUserId: classTeacherUser.id,
      },
      SEED_ACTOR_USER_ID,
    );

    // Roll "1" (Ananya Singh) present, roll "2" (Kabir Singh) absent — varied
    // statuses, not a uniform all-present seed, so the data is representative.
    const statusByRollNumber: Record<string, "PRESENT" | "ABSENT"> = {
      "1": "PRESENT",
      "2": "ABSENT",
    };

    await submitAttendance(
      {
        sessionId: session.id,
        submittedByUserId: classTeacherUser.id,
        records: attendanceEnrollments.map((enrollment) => ({
          enrollmentId: enrollment.id,
          status: statusByRollNumber[enrollment.rollNumber] ?? "PRESENT",
        })),
      },
      SEED_ACTOR_USER_ID,
    );

    console.log(
      `Seeded 1 attendance session for ${attendanceClass.name}-${attendanceSection.name} on ${attendanceDate.toISOString().slice(0, 10)}, with ${attendanceEnrollments.length} attendance records.`,
    );
  } // end if (SEED_DEV_FIXTURES)

  // Sprint B1 — Authentication Foundation (extended, Sprint B2). The
  // Bootstrap Administrator: the one account that exists without ever going
  // through Admin-driven provisioning, because no Admin exists yet to
  // provision it — see docs/product/ADMINISTRATION_STRATEGY.md § 5 and
  // docs/development/DEVELOPMENT_LOGIN.md. `prisma/seed.ts` is this
  // repository's own already-established, manually-invoked bootstrap
  // mechanism (never auto-run by `prisma migrate deploy` — only by an
  // explicit `tsx prisma/seed.ts` call, see prisma.config.ts). Deliberately
  // created via a direct repository call (createUser() + writeAuditLog(),
  // the same shape src/services/identity/identity.service.ts's
  // createIdentityUser() already uses) rather than by extending that
  // Sprint-1 service's input schema to accept a password —
  // src/services/administration/ (Sprint B2) is the real home for
  // password-setting logic now, and this one bootstrap case still doesn't
  // need to route through it.
  //
  // Reads BOOTSTRAP_ADMIN_EMAIL/PASSWORD/NAME from the environment first —
  // the real path a future client deployment uses — falling back to the
  // named DEFAULT_BOOTSTRAP_ADMIN_* constants above for this repository's
  // own dev database. mustChangePassword is set true unconditionally: even
  // an Admin-supplied BOOTSTRAP_ADMIN_PASSWORD should be treated as a
  // provisioning-time value to rotate on first real use, not assumed to
  // already be the permanent one.
  const { hashPassword } = await import("../src/lib/security");
  const { createUser: createBootstrapUser } = await import("../src/repositories/user");
  const { db: seedDb } = await import("../src/lib/db");

  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? DEFAULT_BOOTSTRAP_ADMIN_EMAIL;
  const bootstrapAdminPassword =
    process.env.BOOTSTRAP_ADMIN_PASSWORD ?? DEFAULT_BOOTSTRAP_ADMIN_PASSWORD;
  const bootstrapAdminName = process.env.BOOTSTRAP_ADMIN_NAME ?? DEFAULT_BOOTSTRAP_ADMIN_NAME;

  const existingBootstrapAdmin = await findUserByEmail(bootstrapAdminEmail);
  if (!existingBootstrapAdmin) {
    const administratorRole = await findRoleByName("Administrator");
    if (!administratorRole)
      throw new Error("Expected the Administrator role to already be seeded.");

    const passwordHash = await hashPassword(bootstrapAdminPassword);

    await seedDb.$transaction(async (tx) => {
      const { writeAuditLog } = await import("../src/lib/db-utils");

      const user = await createBootstrapUser(
        {
          email: bootstrapAdminEmail,
          name: bootstrapAdminName,
          passwordHash,
          mustChangePassword: true,
          school: { connect: { schoolId: school.schoolId } },
          role: { connect: { id: administratorRole.id } },
        },
        tx,
      );

      await writeAuditLog(tx, {
        schoolId: school.schoolId,
        entityType: "User",
        entityId: user.id,
        actorUserId: SEED_ACTOR_USER_ID,
        action: "CREATE",
        afterValue: { email: user.email, roleId: administratorRole.id, bootstrap: true },
      });
    });

    console.log(
      process.env.BOOTSTRAP_ADMIN_EMAIL
        ? `Seeded Bootstrap Administrator: ${bootstrapAdminEmail} (credentials from environment).`
        : `Seeded Bootstrap Administrator with PLACEHOLDER credentials: ${bootstrapAdminEmail} / ${bootstrapAdminPassword} — see docs/development/DEVELOPMENT_LOGIN.md. Must change password on first login.`,
    );
  } else {
    console.log(`Bootstrap Administrator already exists: ${bootstrapAdminEmail}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { db } = await import("../src/lib/db");
    await db.$disconnect();
  });
