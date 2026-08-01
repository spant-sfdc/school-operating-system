import type { MarksRecord, Enrollment, Student } from "@/generated/prisma/client";
import type { MarksRecordStatus } from "@/generated/prisma/enums";

export interface MarksRecordDTO {
  id: string;
  enrollmentId: string;
  examSubjectScheduleId: string;
  marksObtained: number;
  grade: string | null;
  status: MarksRecordStatus;
  enteredByUserId: string;
  lastEditedByUserId: string | null;
  lastEditedAt: string | null;
}

type MarksRecordWithRelations = MarksRecord & {
  enrollment: Enrollment & { student: Student };
};

export function toMarksRecordDTO(record: MarksRecordWithRelations): MarksRecordDTO {
  return {
    id: record.id,
    enrollmentId: record.enrollmentId,
    examSubjectScheduleId: record.examSubjectScheduleId,
    marksObtained: Number(record.marksObtained),
    grade: record.grade,
    status: record.status,
    enteredByUserId: record.enteredByUserId,
    lastEditedByUserId: record.lastEditedByUserId,
    lastEditedAt: record.lastEditedAt ? record.lastEditedAt.toISOString() : null,
  };
}
