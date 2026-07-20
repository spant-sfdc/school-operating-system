import type { AcademicYear, School } from "@/generated/prisma/client";

// The Configuration Module's own read/edit shape — School (extended,
// Migration 009) + its current AcademicYear, composed. Distinct from
// src/services/system/dto/schoolDetails.dto.ts's SchoolDetailsDTO (Sprint
// B3, Epic B, frozen) — that DTO exists for the Setup Wizard's own narrower
// verification purpose and is not touched or extended by this sprint;
// duplicating a few overlapping fields (name, affiliationBoard, academic
// year label) here is the correct boundary, not accidental repetition —
// see docs/DECISIONS.md's Sprint C1 entry.
export interface SchoolConfigurationDTO {
  schoolId: string;
  name: string;
  shortName: string | null;
  tagline: string | null;
  affiliationBoard: string | null;
  medium: string | null;
  principalName: string | null;
  principalTitle: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  schoolTimings: string | null;
  officeTimings: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  academicYearId: string;
  academicYearLabel: string;
}

export function toSchoolConfigurationDTO(
  school: School,
  academicYear: AcademicYear,
): SchoolConfigurationDTO {
  return {
    schoolId: school.schoolId,
    name: school.name,
    shortName: school.shortName,
    tagline: school.tagline,
    affiliationBoard: school.affiliationBoard,
    medium: school.medium,
    principalName: school.principalName,
    principalTitle: school.principalTitle,
    email: school.email,
    phone: school.phone,
    address: school.address,
    schoolTimings: school.schoolTimings,
    officeTimings: school.officeTimings,
    logoUrl: school.logoUrl,
    faviconUrl: school.faviconUrl,
    academicYearId: academicYear.id,
    academicYearLabel: academicYear.label,
  };
}
