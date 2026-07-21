import type { Student, Section, SchoolClass, Enrollment } from "@/generated/prisma/client";
import type { StudentStatus } from "@/generated/prisma/enums";

export interface StudentDirectoryRowDTO {
  id: string;
  fullName: string;
  admissionNumber: string;
  status: StudentStatus;
  schoolClassName: string | null;
  sectionName: string | null;
  rollNumber: string | null;
}

export interface StudentDirectoryResultDTO {
  items: StudentDirectoryRowDTO[];
  total: number;
  page: number;
  pageSize: number;
  // The academic year each row's class/section was resolved against —
  // "" when no academic year exists yet for this school at all. Resolving
  // this id to a display label is the caller's job (the Directory page
  // already loads the full academic year list for its own filter
  // dropdown, so it already has every label on hand).
  academicYearId: string;
}

type StudentWithDisplayEnrollment = Student & {
  enrollments: (Enrollment & { section: Section & { schoolClass: SchoolClass } })[];
};

export function toStudentDirectoryRowDTO(
  student: StudentWithDisplayEnrollment,
): StudentDirectoryRowDTO {
  const enrollment = student.enrollments[0];
  return {
    id: student.id,
    fullName: `${student.firstName} ${student.lastName}`,
    admissionNumber: student.admissionNumber,
    status: student.status,
    schoolClassName: enrollment?.section.schoolClass.name ?? null,
    sectionName: enrollment?.section.name ?? null,
    rollNumber: enrollment?.rollNumber ?? null,
  };
}
