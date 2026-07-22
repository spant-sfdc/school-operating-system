import { findCurrentAcademicYear } from "@/repositories/academicYear";
import { listSectionsBySchoolAndYear } from "@/repositories/section";
import { findAttendanceSessionBySectionAndDate } from "@/repositories/attendanceSession";
import { listEnrollmentsBySection } from "@/repositories/enrollment";
import { listAssignmentsForSection } from "@/repositories/teacherAssignment";
import { listActiveTeachersBySchool } from "@/repositories/teacher";
import { checkSystemReadiness, getSchoolDetails } from "@/services/system";
import { getConfigurationSummary } from "@/services/configuration";
import { listImportBatches } from "@/services/import";
import { searchStudentDirectory } from "@/services/student/studentDirectory.service";
import {
  deriveConfiguredStatus,
  type PrincipalWorkspaceDTO,
  type AttendanceOverviewDTO,
  type OperationalAlertDTO,
  type PrincipalQuickActionDTO,
} from "@/services/principal/principalWorkspace.dto";

interface SectionAttendanceState {
  sectionId: string;
  totalStudents: number;
  markedCount: number;
  completed: boolean;
  assignmentCount: number;
}

/**
 * Computed once, reused for both Attendance Overview and Teacher
 * Overview's own attendance figures — a school's Attendance Completed/
 * Pending counts and a "how many Class Teachers have completed today"
 * count are the same underlying fact (one Class Teacher per section, by
 * design), not two separate things to compute. Reuses
 * findAttendanceSessionBySectionAndDate()/listEnrollmentsBySection()
 * (Sprint E2/E1/E3's own already-established primitives) and
 * listAssignmentsForSection() (Sprint 4) — no new repository query
 * beyond listSectionsBySchoolAndYear() itself.
 */
async function computeSectionStates(
  schoolId: string,
  academicYearId: string,
): Promise<SectionAttendanceState[]> {
  const sections = await listSectionsBySchoolAndYear(schoolId, academicYearId);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return Promise.all(
    sections.map(async (section) => {
      const [session, enrollments, assignments] = await Promise.all([
        findAttendanceSessionBySectionAndDate(section.id, today),
        listEnrollmentsBySection(section.id, academicYearId),
        listAssignmentsForSection(section.id, academicYearId),
      ]);
      const markedCount = session?.records?.length ?? 0;
      const totalStudents = enrollments.length;
      return {
        sectionId: section.id,
        totalStudents,
        markedCount,
        completed: totalStudents > 0 && markedCount === totalStudents,
        assignmentCount: assignments.length,
      };
    }),
  );
}

function buildAttendanceOverview(sectionStates: SectionAttendanceState[]): AttendanceOverviewDTO {
  const completedSections = sectionStates.filter((s) => s.completed).length;
  const totalStudentsMarked = sectionStates.reduce((sum, s) => sum + s.markedCount, 0);
  const totalEnrollments = sectionStates.reduce((sum, s) => sum + s.totalStudents, 0);
  return {
    completedSections,
    pendingSections: sectionStates.length - completedSections,
    totalSections: sectionStates.length,
    totalStudentsMarked,
    totalEnrollments,
    attendancePercent:
      totalEnrollments === 0 ? 0 : Math.round((totalStudentsMarked / totalEnrollments) * 1000) / 10,
  };
}

function buildAlerts(input: {
  hasAcademicYear: boolean;
  bootstrapReady: boolean;
  configNeedsAttentionCount: number;
  pendingSections: number;
  failedImportCount: number;
}): OperationalAlertDTO[] {
  const alerts: OperationalAlertDTO[] = [];

  if (!input.hasAcademicYear) {
    alerts.push({
      id: "no-academic-year",
      severity: "error",
      message: "No current Academic Year is configured.",
    });
  }
  if (!input.bootstrapReady) {
    alerts.push({
      id: "no-bootstrap",
      severity: "error",
      message: "No Bootstrap Administrator account exists yet.",
    });
  }
  if (input.configNeedsAttentionCount > 0) {
    alerts.push({
      id: "configuration-incomplete",
      severity: "warning",
      message: `${input.configNeedsAttentionCount} configuration field(s) need attention.`,
    });
  }
  if (input.pendingSections > 0) {
    alerts.push({
      id: "attendance-not-completed",
      severity: "warning",
      message: `${input.pendingSections} section(s) have not completed attendance today.`,
    });
  }
  if (input.failedImportCount > 0) {
    alerts.push({
      id: "import-failed",
      severity: "error",
      message: `${input.failedImportCount} import batch(es) failed or only partially completed.`,
    });
  }
  // A deliberate placeholder, per this sprint's own "deterministic alerts
  // only... audit anomaly placeholder" instruction — no anomaly-detection
  // logic exists to back this, and none is being invented here.
  alerts.push({
    id: "audit-anomaly-placeholder",
    severity: "info",
    message: "Audit anomaly detection is a planned future capability — nothing to report yet.",
  });

  return alerts;
}

// "Teachers" now links to the real Teacher Directory (/admin/teachers,
// Sprint E5) — D-051's own named gap closed, superseding the pre-filtered
// /admin/users?roleId=... link that sprint used as an honest stand-in
// before a real Teacher list existed. findRoleByName("Teacher") is no
// longer needed for this link, but stays imported/used nowhere else in
// this file as of this sprint — removed below. "Attendance" has no
// Admin-facing oversight page either (D-049's own named future gap,
// reaffirmed in D-052 too) — its Quick Action still anchors to this same
// Dashboard's own Attendance Overview section instead of a broken link.
// "System Setup"/"Developer Information" aren't among D-051's own 7 named
// actions, but were real, working links on the page that sprint enhanced
// (Sprint B3) — kept, not silently dropped, per this codebase's own "do
// not redesign existing domains" instruction; removing working navigation
// would itself be an undiscussed redesign.
async function buildQuickActions(): Promise<PrincipalQuickActionDTO[]> {
  return [
    { id: "students", label: "Students", href: "/admin/students" },
    { id: "teachers", label: "Teachers", href: "/admin/teachers" },
    { id: "attendance", label: "Attendance", href: "#attendance-overview" },
    { id: "configuration", label: "Configuration", href: "/admin/configuration" },
    { id: "imports", label: "Imports", href: "/admin/imports" },
    { id: "audit", label: "Audit", href: "/admin/audit" },
    { id: "users", label: "Users", href: "/admin/users" },
    { id: "system-setup", label: "System Setup", href: "/admin/setup" },
    { id: "developer-info", label: "Developer Information", href: "/admin/system" },
  ];
}

/**
 * Principal Workspace ("Principal 360") — Sprint E4's own "within 30
 * seconds, does the school look normal today" Business Workflow Review.
 * A read-composition service, exactly like every prior Epic E Workspace:
 * no new database table, composes checkSystemReadiness()/getSchoolDetails()
 * (Sprint B3), getConfigurationSummary() (Sprint C1), listImportBatches()
 * (Sprint D1/D3), and searchStudentDirectory() (Sprint E1) completely
 * unchanged, plus one shared per-section computation (computeSectionStates,
 * above) feeding both Attendance Overview and Teacher Overview.
 */
export async function getPrincipalWorkspace(schoolId: string): Promise<PrincipalWorkspaceDTO> {
  const [readiness, schoolDetails, configSummary] = await Promise.all([
    checkSystemReadiness(),
    getSchoolDetails(),
    getConfigurationSummary(),
  ]);

  const currentAcademicYear = await findCurrentAcademicYear(schoolId);

  const sectionStates = currentAcademicYear
    ? await computeSectionStates(schoolId, currentAcademicYear.id)
    : [];
  const attendanceOverview = buildAttendanceOverview(sectionStates);

  const teachers = await listActiveTeachersBySchool(schoolId);
  const totalAssignments = sectionStates.reduce((sum, s) => sum + s.assignmentCount, 0);

  const [totalResult, activeResult, recentResult, failedBatches, partialBatches] =
    await Promise.all([
      currentAcademicYear
        ? searchStudentDirectory(schoolId, {
            academicYearId: currentAcademicYear.id,
            status: "ALL",
          })
        : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 20, academicYearId: "" }),
      currentAcademicYear
        ? searchStudentDirectory(schoolId, {
            academicYearId: currentAcademicYear.id,
            status: "ACTIVE",
          })
        : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 20, academicYearId: "" }),
      currentAcademicYear
        ? searchStudentDirectory(schoolId, {
            academicYearId: currentAcademicYear.id,
            status: "ALL",
            sortBy: "recent",
          })
        : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 20, academicYearId: "" }),
      listImportBatches({ schoolId, status: "FAILED", page: 1, pageSize: 1 }),
      listImportBatches({ schoolId, status: "PARTIALLY_COMPLETED", page: 1, pageSize: 1 }),
    ]);

  const quickActions = await buildQuickActions();

  const alerts = buildAlerts({
    hasAcademicYear: currentAcademicYear !== null,
    bootstrapReady: readiness.bootstrap.ready,
    configNeedsAttentionCount: configSummary.needsAttentionCount,
    pendingSections: attendanceOverview.pendingSections,
    failedImportCount: failedBatches.total + partialBatches.total,
  });

  return {
    schoolOverview: {
      schoolName: schoolDetails?.name ?? "—",
      academicYearLabel: schoolDetails?.academicYearLabel ?? "—",
      todayDate: new Date().toISOString(),
      configuredStatus: deriveConfiguredStatus(configSummary.needsAttentionCount),
      systemReady: readiness.overallReady,
    },
    attendanceOverview,
    teacherOverview: {
      totalTeachers: teachers.length,
      totalAssignments,
      attendanceCompletedCount: attendanceOverview.completedSections,
      attendancePendingCount: attendanceOverview.pendingSections,
    },
    studentOverview: {
      totalStudents: totalResult.total,
      currentEnrollments: attendanceOverview.totalEnrollments,
      recentlyAdded: recentResult.items.slice(0, 5).map((s) => ({
        id: s.id,
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
      })),
      inactiveStudents: totalResult.total - activeResult.total,
    },
    alerts,
    quickActions,
    recentActivity: {
      available: false,
      reason: "Timeline is a planned future capability — see docs/domain/EVENT_MODEL.md.",
    },
  };
}
