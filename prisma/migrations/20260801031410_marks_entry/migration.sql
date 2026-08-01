-- CreateEnum
CREATE TYPE "marks_record_status" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "marks_records" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "exam_subject_schedule_id" TEXT NOT NULL,
    "marksObtained" DECIMAL(65,30) NOT NULL,
    "grade" TEXT,
    "status" "marks_record_status" NOT NULL DEFAULT 'DRAFT',
    "entered_by_user_id" TEXT NOT NULL,
    "last_edited_by_user_id" TEXT,
    "last_edited_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "marks_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marks_records_exam_subject_schedule_id_idx" ON "marks_records"("exam_subject_schedule_id");

-- CreateIndex
CREATE INDEX "marks_records_school_id_idx" ON "marks_records"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "marks_records_enrollment_id_exam_subject_schedule_id_key" ON "marks_records"("enrollment_id", "exam_subject_schedule_id");

-- AddForeignKey
ALTER TABLE "marks_records" ADD CONSTRAINT "marks_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_records" ADD CONSTRAINT "marks_records_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_records" ADD CONSTRAINT "marks_records_exam_subject_schedule_id_fkey" FOREIGN KEY ("exam_subject_schedule_id") REFERENCES "exam_subject_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
