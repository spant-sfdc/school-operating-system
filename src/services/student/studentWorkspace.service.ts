import { findStudentById, listGuardiansForStudent } from "@/repositories/student";
import { findEnrollmentByStudentAndYear } from "@/repositories/enrollment";
import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { countAttendanceByEnrollment } from "@/repositories/attendanceRecord";
import { toStudentDTO } from "@/services/student/student.dto";
import { toEnrollmentDTO } from "@/services/student/enrollment.dto";
import { toGuardianDTO } from "@/services/student/guardian.dto";
import {
  buildAttendanceSummary,
  type StudentWorkspaceDTO,
  type QuickActionDTO,
} from "@/services/student/studentWorkspace.dto";

function buildQuickActions(): QuickActionDTO[] {
  return [
    {
      id: "edit-student",
      label: "Edit Student",
      href: null,
      enabled: false,
      reason: "Student editing is not yet built.",
    },
    {
      id: "transfer-student",
      label: "Transfer Student",
      href: null,
      enabled: false,
      reason: "Transfer is a planned future capability — see docs/domain/DOMAIN_MODEL.md § 6.4.",
    },
    {
      id: "promote-student",
      label: "Promote Student",
      href: null,
      enabled: false,
      reason: "Promotion is a planned future capability — see docs/domain/DOMAIN_MODEL.md § 6.3.",
    },
    {
      id: "deactivate-student",
      label: "Deactivate Student",
      href: null,
      enabled: false,
      reason: "Student deactivation is not yet built.",
    },
    {
      id: "generate-tc",
      label: "Generate Transfer Certificate",
      href: null,
      enabled: false,
      reason: "Transfer Certificate generation is a planned future capability.",
    },
    {
      id: "manage-guardian",
      label: "Manage Guardian",
      href: null,
      enabled: false,
      reason: "Guardian management is not yet built as its own workspace.",
    },
    {
      id: "import-history",
      label: "Import History",
      // Real, working link — the Import Engine is frozen and functional
      // (Epic D, D-046); this is genuine reuse, not a placeholder. It
      // links to the batch-level history, not a student-scoped filter —
      // no such filter exists on /admin/imports today.
      href: "/admin/imports",
      enabled: true,
    },
  ];
}

/**
 * Student Workspace ("Student 360") — Sprint E1's own read-composition
 * service. Composes existing repository reads (Student, Guardian links,
 * current Enrollment, Attendance counts) into one DTO; creates no new
 * database table and calls no repository this codebase doesn't already
 * have, per this sprint's own "Do NOT create a new database table" and
 * "compose existing repositories/services" instructions. Academic
 * Snapshot, Recent Activity, and Documents are honest, typed empty states
 * (see studentWorkspace.dto.ts's own WorkspacePlaceholderDTO comment) —
 * their underlying entities (Examination/MarksRecord, AuditLog-backed
 * Timeline, DocumentRecord) don't exist in this schema yet.
 */
export async function getStudentWorkspace(
  studentId: string,
  schoolId: string,
): Promise<StudentWorkspaceDTO | null> {
  const student = await findStudentById(studentId);
  if (!student || student.schoolId !== schoolId) {
    return null;
  }

  const [guardianLinks, currentAcademicYear] = await Promise.all([
    listGuardiansForStudent(studentId),
    findCurrentAcademicYear(schoolId),
  ]);

  const currentEnrollment = currentAcademicYear
    ? await findEnrollmentByStudentAndYear(studentId, currentAcademicYear.id)
    : null;

  const attendanceSummary = currentEnrollment
    ? buildAttendanceSummary(
        currentEnrollment.academicYearId,
        await countAttendanceByEnrollment(currentEnrollment.id),
      )
    : ({
        available: false,
        reason: "This student has no enrollment for the current academic year.",
      } as const);

  return {
    student: toStudentDTO(student),
    currentEnrollment: currentEnrollment ? toEnrollmentDTO(currentEnrollment) : null,
    guardians: guardianLinks.map((link) => ({
      guardian: toGuardianDTO(link.guardian),
      relationshipType: link.relationshipType,
      isPrimaryContact: link.isPrimaryContact,
      isAuthorizedForPickup: link.isAuthorizedForPickup,
    })),
    attendanceSummary,
    academicSnapshot: {
      available: false,
      reason: "Examinations aren't built yet — see Epic E's own Examination slice.",
    },
    recentActivity: {
      available: false,
      reason: "Timeline is a planned future capability — see docs/domain/EVENT_MODEL.md.",
    },
    documents: {
      available: false,
      reason: "Document management is a planned future capability.",
    },
    quickActions: buildQuickActions(),
  };
}
