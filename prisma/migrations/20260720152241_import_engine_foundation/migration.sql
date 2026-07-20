-- CreateEnum
CREATE TYPE "import_entity_type" AS ENUM ('STUDENT', 'TEACHER', 'GUARDIAN', 'SCHOOL_CLASS', 'SECTION', 'SUBJECT', 'ATTENDANCE', 'ADMISSION', 'RESULT', 'FEE', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "import_file_format" AS ENUM ('CSV', 'XLSX', 'ODS');

-- CreateEnum
CREATE TYPE "import_status" AS ENUM ('UPLOADED', 'DETECTED', 'MAPPED', 'VALIDATED', 'PREVIEWED', 'COMMITTING', 'COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED');

-- CreateEnum
CREATE TYPE "import_row_status" AS ENUM ('PENDING', 'VALID', 'INVALID', 'SKIPPED', 'COMMITTED', 'FAILED');

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "import_type" "import_entity_type" NOT NULL,
    "status" "import_status" NOT NULL DEFAULT 'UPLOADED',
    "source_file_name" TEXT NOT NULL,
    "source_file_type" "import_file_format" NOT NULL,
    "source_file_hash" TEXT,
    "column_mapping" JSONB,
    "total_rows" INTEGER,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "raw_data" JSONB NOT NULL,
    "status" "import_row_status" NOT NULL DEFAULT 'PENDING',
    "validation_errors" JSONB,
    "entity_id" TEXT,
    "committed_at" TIMESTAMPTZ(3),

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_batches_school_id_import_type_created_at_idx" ON "import_batches"("school_id", "import_type", "created_at");

-- CreateIndex
CREATE INDEX "import_batches_school_id_source_file_hash_idx" ON "import_batches"("school_id", "source_file_hash");

-- CreateIndex
CREATE INDEX "import_rows_import_batch_id_status_row_number_idx" ON "import_rows"("import_batch_id", "status", "row_number");

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
