
-- AlterEnum
BEGIN;
CREATE TYPE "import_entity_type_new" AS ENUM ('STUDENT', 'TEACHER', 'GUARDIAN', 'ACADEMIC_STRUCTURE', 'ATTENDANCE', 'ADMISSION', 'RESULT', 'FEE', 'TRANSPORT');
ALTER TABLE "import_batches" ALTER COLUMN "import_type" TYPE "import_entity_type_new" USING ("import_type"::text::"import_entity_type_new");
ALTER TYPE "import_entity_type" RENAME TO "import_entity_type_old";
ALTER TYPE "import_entity_type_new" RENAME TO "import_entity_type";
DROP TYPE "public"."import_entity_type_old";
COMMIT;

