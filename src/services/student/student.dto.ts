import type { Guardian, Student } from "@/generated/prisma/client";
import type { RelationshipType, StudentStatus } from "@/generated/prisma/enums";
import { type GuardianDTO, toGuardianDTO } from "@/services/student/guardian.dto";

export interface StudentGuardianLinkDTO {
  guardian: GuardianDTO;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
  isAuthorizedForPickup: boolean;
}

export interface StudentDTO {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: string | null;
  photoUrl: string | null;
  admissionNumber: string;
  category: string | null;
  status: StudentStatus;
  guardians?: StudentGuardianLinkDTO[];
}

interface GuardianLinkInput {
  guardian: Guardian;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
  isAuthorizedForPickup: boolean;
}

// `udisePen` is deliberately excluded — a government-issued permanent
// education number for a minor (DATA_DICTIONARY.md's PII classification;
// BUSINESS_RULES.md § 8, DPDP Act 2023). No current or planned Student
// Foundation consumer needs it by default; a workflow that genuinely does
// (TC generation, government reporting) should query the repository
// directly for that narrow purpose, not receive it through this
// general-purpose DTO.
export function toStudentDTO(student: Student, guardianLinks?: GuardianLinkInput[]): StudentDTO {
  return {
    id: student.id,
    schoolId: student.schoolId,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: `${student.firstName} ${student.lastName}`,
    dateOfBirth: student.dateOfBirth.toISOString(),
    gender: student.gender,
    photoUrl: student.photoUrl,
    admissionNumber: student.admissionNumber,
    category: student.category,
    status: student.status,
    ...(guardianLinks
      ? {
          guardians: guardianLinks.map((link) => ({
            guardian: toGuardianDTO(link.guardian),
            relationshipType: link.relationshipType,
            isPrimaryContact: link.isPrimaryContact,
            isAuthorizedForPickup: link.isAuthorizedForPickup,
          })),
        }
      : {}),
  };
}
