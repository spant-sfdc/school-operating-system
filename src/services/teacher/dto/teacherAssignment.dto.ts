import type {
  AcademicYear,
  Section,
  SchoolClass,
  Subject,
  Teacher,
  TeacherAssignment,
} from "@/generated/prisma/client";

export interface TeacherAssignmentDTO {
  id: string;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  academicYearLabel: string;
  sectionId: string;
  sectionName: string;
  schoolClassName: string;
  subjectId: string | null;
  subjectName: string | null;
  isClassTeacher: boolean;
}

type TeacherAssignmentWithRelations = TeacherAssignment & {
  teacher: Teacher;
  academicYear: AcademicYear;
  section: Section & { schoolClass: SchoolClass };
  subject: Subject | null;
};

// A composed view, not bare foreign keys — same reasoning as
// src/services/student/enrollment.dto.ts's toEnrollmentDTO().
export function toTeacherAssignmentDTO(
  assignment: TeacherAssignmentWithRelations,
): TeacherAssignmentDTO {
  return {
    id: assignment.id,
    teacherId: assignment.teacherId,
    teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
    academicYearId: assignment.academicYearId,
    academicYearLabel: assignment.academicYear.label,
    sectionId: assignment.sectionId,
    sectionName: assignment.section.name,
    schoolClassName: assignment.section.schoolClass.name,
    subjectId: assignment.subjectId,
    subjectName: assignment.subject?.name ?? null,
    isClassTeacher: assignment.isClassTeacher,
  };
}
