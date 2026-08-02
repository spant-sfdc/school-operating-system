-- CreateEnum
CREATE TYPE "promotion_outcome" AS ENUM ('PROMOTED', 'DETAINED', 'TRANSFERRED_OUT', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "promotion_basis" AS ENUM ('NO_DETENTION_POLICY', 'EXAM_RESULT', 'RE_EXAM');

-- CreateTable
CREATE TABLE "promotion_records" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "source_enrollment_id" TEXT NOT NULL,
    "resulting_enrollment_id" TEXT,
    "outcome" "promotion_outcome" NOT NULL,
    "basis" "promotion_basis" NOT NULL,
    "decided_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promotion_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotion_records_source_enrollment_id_key" ON "promotion_records"("source_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_records_resulting_enrollment_id_key" ON "promotion_records"("resulting_enrollment_id");

-- CreateIndex
CREATE INDEX "promotion_records_school_id_outcome_idx" ON "promotion_records"("school_id", "outcome");

-- AddForeignKey
ALTER TABLE "promotion_records" ADD CONSTRAINT "promotion_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_records" ADD CONSTRAINT "promotion_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_records" ADD CONSTRAINT "promotion_records_source_enrollment_id_fkey" FOREIGN KEY ("source_enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_records" ADD CONSTRAINT "promotion_records_resulting_enrollment_id_fkey" FOREIGN KEY ("resulting_enrollment_id") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
