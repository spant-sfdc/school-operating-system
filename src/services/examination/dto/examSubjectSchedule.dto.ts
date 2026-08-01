import type { ExamSubjectSchedule, Subject, Teacher } from "@/generated/prisma/client";
import type { ExamSubjectScheduleStatus } from "@/generated/prisma/enums";

export interface ExamSubjectScheduleDTO {
  id: string;
  examinationId: string;
  subjectId: string;
  subjectName: string;
  // Informational only — never the marks-entry authority. See the
  // Prisma schema's own migration-header comment for why.
  teacherId: string | null;
  teacherName: string | null;
  examDate: string | null;
  maxMarks: number;
  passMarks: number;
  durationMinutes: number | null;
  room: string | null;
  instructions: string | null;
  status: ExamSubjectScheduleStatus;
}

type ScheduleWithRelations = ExamSubjectSchedule & {
  subject: Subject;
  teacher: Teacher | null;
};

export function toExamSubjectScheduleDTO(schedule: ScheduleWithRelations): ExamSubjectScheduleDTO {
  return {
    id: schedule.id,
    examinationId: schedule.examinationId,
    subjectId: schedule.subjectId,
    subjectName: schedule.subject.name,
    teacherId: schedule.teacherId,
    teacherName: schedule.teacher
      ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
      : null,
    examDate: schedule.examDate ? schedule.examDate.toISOString() : null,
    maxMarks: schedule.maxMarks,
    passMarks: schedule.passMarks,
    durationMinutes: schedule.durationMinutes,
    room: schedule.room,
    instructions: schedule.instructions,
    status: schedule.status,
  };
}
