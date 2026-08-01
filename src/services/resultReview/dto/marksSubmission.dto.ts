import type {
  MarksSubmission,
  ExamSubjectSchedule,
  Subject,
  Section,
  SchoolClass,
} from "@/generated/prisma/client";
import type { MarksSubmissionStatus } from "@/generated/prisma/enums";

export interface MarksSubmissionDTO {
  id: string;
  examinationId: string;
  examSubjectScheduleId: string;
  subjectName: string;
  sectionId: string;
  schoolClassName: string;
  sectionName: string;
  status: MarksSubmissionStatus;
  submittedByUserId: string;
  submittedAt: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  returnReason: string | null;
  resubmissionCount: number;
}

type MarksSubmissionWithRelations = MarksSubmission & {
  examSubjectSchedule: ExamSubjectSchedule & { subject: Subject };
  section: Section & { schoolClass: SchoolClass };
};

export function toMarksSubmissionDTO(submission: MarksSubmissionWithRelations): MarksSubmissionDTO {
  return {
    id: submission.id,
    examinationId: submission.examinationId,
    examSubjectScheduleId: submission.examSubjectScheduleId,
    subjectName: submission.examSubjectSchedule.subject.name,
    sectionId: submission.sectionId,
    schoolClassName: submission.section.schoolClass.name,
    sectionName: submission.section.name,
    status: submission.status,
    submittedByUserId: submission.submittedByUserId,
    submittedAt: submission.submittedAt.toISOString(),
    reviewedByUserId: submission.reviewedByUserId,
    reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : null,
    returnReason: submission.returnReason,
    resubmissionCount: submission.resubmissionCount,
  };
}
