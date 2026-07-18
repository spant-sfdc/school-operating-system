import type { TeacherQualification } from "@/generated/prisma/client";

export interface TeacherQualificationDTO {
  id: string;
  teacherId: string;
  qualificationType: string;
  institution: string | null;
  yearCompleted: number | null;
}

export function toTeacherQualificationDTO(
  qualification: TeacherQualification,
): TeacherQualificationDTO {
  return {
    id: qualification.id,
    teacherId: qualification.teacherId,
    qualificationType: qualification.qualificationType,
    institution: qualification.institution,
    yearCompleted: qualification.yearCompleted,
  };
}
