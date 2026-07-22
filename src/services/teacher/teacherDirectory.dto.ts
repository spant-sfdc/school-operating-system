import type {
  Teacher,
  User,
  Role,
  TeacherAssignment,
  Section,
  SchoolClass,
  Subject,
  TeacherQualification,
} from "@/generated/prisma/client";
import type { TeacherStatus } from "@/generated/prisma/enums";

export interface TeacherDirectoryRowDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: TeacherStatus;
  isAccountActive: boolean;
  // "Class - Section" labels for every current-year Class Teacher
  // assignment — usually zero or one (a section has at most one Class
  // Teacher, per the schema's own partial unique index), shown as a list
  // rather than a single nullable field so the row shape stays honest if
  // that constraint is ever relaxed.
  classTeacherFor: string[];
  // "Subject (Class - Section)" labels for every current-year subject
  // assignment.
  subjectTeacherFor: string[];
  qualificationCount: number;
  highestQualification: string | null;
}

export interface TeacherDirectoryResultDTO {
  items: TeacherDirectoryRowDTO[];
  total: number;
  page: number;
  pageSize: number;
  academicYearId: string;
}

type TeacherRow = Teacher & {
  user: User & { role: Role };
  assignments: (TeacherAssignment & {
    section: Section & { schoolClass: SchoolClass };
    subject: Subject | null;
  })[];
  qualifications: TeacherQualification[];
};

// "Highest Qualification" — no ranking field exists in the schema
// (qualificationType is a free string an Admin types at registration, not
// a leveled enum), so there is no real academic hierarchy to compute. The
// honest, documented proxy used here (and in toAdminTeacherWorkspaceDTO()
// below) is "most recently completed" (`yearCompleted` descending) — a
// real, defensible signal, not a fabricated ranking. See D-052.
export function pickHighestQualification(
  qualifications: Pick<TeacherQualification, "qualificationType" | "yearCompleted">[],
): string | null {
  if (qualifications.length === 0) return null;
  const sorted = [...qualifications].sort(
    (a, b) => (b.yearCompleted ?? 0) - (a.yearCompleted ?? 0),
  );
  return sorted[0].qualificationType;
}

export function toTeacherDirectoryRowDTO(teacher: TeacherRow): TeacherDirectoryRowDTO {
  const classTeacherFor = teacher.assignments
    .filter((a) => a.isClassTeacher)
    .map((a) => `${a.section.schoolClass.name} - ${a.section.name}`);
  const subjectTeacherFor = teacher.assignments
    .filter((a) => !a.isClassTeacher)
    .map((a) => `${a.subject?.name ?? "—"} (${a.section.schoolClass.name} - ${a.section.name})`);

  return {
    id: teacher.id,
    fullName: `${teacher.firstName} ${teacher.lastName}`,
    email: teacher.user.email,
    phone: teacher.phone,
    status: teacher.status,
    isAccountActive: teacher.user.deactivatedAt === null,
    classTeacherFor,
    subjectTeacherFor,
    qualificationCount: teacher.qualifications.length,
    highestQualification: pickHighestQualification(teacher.qualifications),
  };
}
