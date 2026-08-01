import type { Examination, ExamTerm, AcademicYear, SchoolClass } from "@/generated/prisma/client";
import type { ExaminationStatus } from "@/generated/prisma/enums";

export interface ExaminationDTO {
  id: string;
  schoolId: string;
  examTermId: string;
  examTermName: string;
  academicYearId: string;
  academicYearLabel: string;
  schoolClassId: string;
  schoolClassName: string;
  name: string;
  description: string | null;
  status: ExaminationStatus;
  startDate: string | null;
  endDate: string | null;
}

type ExaminationWithRelations = Examination & {
  examTerm: ExamTerm;
  academicYear: AcademicYear;
  schoolClass: SchoolClass;
};

export function toExaminationDTO(examination: ExaminationWithRelations): ExaminationDTO {
  return {
    id: examination.id,
    schoolId: examination.schoolId,
    examTermId: examination.examTermId,
    examTermName: examination.examTerm.name,
    academicYearId: examination.academicYearId,
    academicYearLabel: examination.academicYear.label,
    schoolClassId: examination.schoolClassId,
    schoolClassName: examination.schoolClass.name,
    name: examination.name,
    description: examination.description,
    status: examination.status,
    startDate: examination.startDate ? examination.startDate.toISOString() : null,
    endDate: examination.endDate ? examination.endDate.toISOString() : null,
  };
}
