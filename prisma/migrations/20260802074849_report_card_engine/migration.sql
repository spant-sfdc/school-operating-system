-- AlterTable
ALTER TABLE "school_classes" ADD COLUMN     "grade_scale_id" TEXT;

-- CreateTable
CREATE TABLE "report_cards" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "examination_id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "generated_by_user_id" TEXT NOT NULL,
    "generated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_enrollment_id_examination_id_key" ON "report_cards"("enrollment_id", "examination_id");

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_grade_scale_id_fkey" FOREIGN KEY ("grade_scale_id") REFERENCES "grade_scales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
