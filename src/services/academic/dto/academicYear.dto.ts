import type { AcademicYear } from "@/generated/prisma/client";
import type { AcademicYearStatus } from "@/generated/prisma/enums";

export interface AcademicYearDTO {
  id: string;
  schoolId: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: AcademicYearStatus;
}

export function toAcademicYearDTO(academicYear: AcademicYear): AcademicYearDTO {
  return {
    id: academicYear.id,
    schoolId: academicYear.schoolId,
    label: academicYear.label,
    startDate: academicYear.startDate.toISOString(),
    endDate: academicYear.endDate.toISOString(),
    isCurrent: academicYear.isCurrent,
    status: academicYear.status,
  };
}
