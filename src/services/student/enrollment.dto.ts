import type {
  AcademicYear,
  Enrollment,
  SchoolClass,
  Section,
  Student,
} from "@/generated/prisma/client";

export interface EnrollmentDTO {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  academicYearId: string;
  academicYearLabel: string;
  sectionId: string;
  sectionName: string;
  schoolClassName: string;
  rollNumber: string;
}

type EnrollmentWithRelations = Enrollment & {
  student: Student;
  academicYear: AcademicYear;
  section: Section & { schoolClass: SchoolClass };
};

// Enrollment is the aggregate root (docs/database/DATABASE_REVIEW.md § 1/
// § 8) — its DTO composes the student/section/class/year it joins, not
// just the bare foreign keys, since that composed shape is the whole
// reason a consumer would want this DTO over the raw repository result.
export function toEnrollmentDTO(enrollment: EnrollmentWithRelations): EnrollmentDTO {
  return {
    id: enrollment.id,
    schoolId: enrollment.schoolId,
    studentId: enrollment.studentId,
    studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
    academicYearId: enrollment.academicYearId,
    academicYearLabel: enrollment.academicYear.label,
    sectionId: enrollment.sectionId,
    sectionName: enrollment.section.name,
    schoolClassName: enrollment.section.schoolClass.name,
    rollNumber: enrollment.rollNumber,
  };
}
