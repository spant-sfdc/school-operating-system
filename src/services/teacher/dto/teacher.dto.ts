import type { Teacher } from "@/generated/prisma/client";
import type { TeacherStatus } from "@/generated/prisma/enums";
import type { TeacherQualificationDTO } from "@/services/teacher/dto/teacherQualification.dto";

export interface TeacherDTO {
  id: string;
  schoolId: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  gender: string | null;
  dateOfBirth: string | null;
  photoUrl: string | null;
  status: TeacherStatus;
  qualifications?: TeacherQualificationDTO[];
}

export function toTeacherDTO(
  teacher: Teacher,
  qualifications?: TeacherQualificationDTO[],
): TeacherDTO {
  return {
    id: teacher.id,
    schoolId: teacher.schoolId,
    userId: teacher.userId,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    fullName: `${teacher.firstName} ${teacher.lastName}`,
    phone: teacher.phone,
    gender: teacher.gender,
    dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString() : null,
    photoUrl: teacher.photoUrl,
    status: teacher.status,
    ...(qualifications ? { qualifications } : {}),
  };
}
