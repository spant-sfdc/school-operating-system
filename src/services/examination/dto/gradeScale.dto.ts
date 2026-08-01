import type { GradeScale } from "@/generated/prisma/client";
import type { GradeScaleType } from "@/generated/prisma/enums";
import type { GradeBandInput } from "@/lib/validations/examination";

export interface GradeScaleDTO {
  id: string;
  schoolId: string;
  name: string;
  type: GradeScaleType;
  bands: GradeBandInput[];
}

export function toGradeScaleDTO(gradeScale: GradeScale): GradeScaleDTO {
  return {
    id: gradeScale.id,
    schoolId: gradeScale.schoolId,
    name: gradeScale.name,
    type: gradeScale.type,
    // `bands` is stored as Prisma Json — cast at this one boundary
    // (service/DTO layer), never left as `unknown` beyond it. Shape is
    // guaranteed by createGradeScaleInputSchema at write time.
    bands: (gradeScale.bands as GradeBandInput[]) ?? [],
  };
}
