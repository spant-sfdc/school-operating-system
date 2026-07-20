import type { AcademicYear, School } from "@/generated/prisma/client";

// The Setup Wizard's Step 2 display/edit shape — School + its current
// AcademicYear, composed, not the two raw Prisma models.
export interface SchoolDetailsDTO {
  schoolId: string;
  name: string;
  shortName: string | null;
  affiliationBoard: string | null;
  status: string;
  academicYearId: string;
  academicYearLabel: string;
  academicYearStatus: string;
}

export function toSchoolDetailsDTO(school: School, academicYear: AcademicYear): SchoolDetailsDTO {
  return {
    schoolId: school.schoolId,
    name: school.name,
    shortName: school.shortName,
    affiliationBoard: school.affiliationBoard,
    status: school.status,
    academicYearId: academicYear.id,
    academicYearLabel: academicYear.label,
    academicYearStatus: academicYear.status,
  };
}
