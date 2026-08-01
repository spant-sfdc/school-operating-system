import type { ExamTerm } from "@/generated/prisma/client";

export interface ExamTermDTO {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  sortOrder: number;
  weightagePercent: number | null;
}

export function toExamTermDTO(examTerm: ExamTerm): ExamTermDTO {
  return {
    id: examTerm.id,
    schoolId: examTerm.schoolId,
    academicYearId: examTerm.academicYearId,
    name: examTerm.name,
    sortOrder: examTerm.sortOrder,
    weightagePercent: examTerm.weightagePercent,
  };
}
