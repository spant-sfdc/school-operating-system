-- CreateEnum
CREATE TYPE "marks_submission_status" AS ENUM ('SUBMITTED', 'RETURNED', 'APPROVED');

-- AlterEnum
ALTER TYPE "examination_status" ADD VALUE 'PUBLISHED';

-- AlterTable
ALTER TABLE "examinations" ADD COLUMN     "published_at" TIMESTAMPTZ(3),
ADD COLUMN     "published_by_user_id" TEXT;

-- CreateTable
CREATE TABLE "marks_submissions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "examination_id" TEXT NOT NULL,
    "exam_subject_schedule_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "status" "marks_submission_status" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_by_user_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL,
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "return_reason" TEXT,
    "resubmission_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "marks_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marks_submissions_examination_id_status_idx" ON "marks_submissions"("examination_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "marks_submissions_exam_subject_schedule_id_section_id_key" ON "marks_submissions"("exam_subject_schedule_id", "section_id");

-- AddForeignKey
ALTER TABLE "marks_submissions" ADD CONSTRAINT "marks_submissions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_submissions" ADD CONSTRAINT "marks_submissions_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_submissions" ADD CONSTRAINT "marks_submissions_exam_subject_schedule_id_fkey" FOREIGN KEY ("exam_subject_schedule_id") REFERENCES "exam_subject_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_submissions" ADD CONSTRAINT "marks_submissions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
