-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "level" TEXT;

-- Backfill existing courses with a sensible default derived from the current seed/domain.
UPDATE "Course"
SET "level" = 'Ensino Médio Integrado'
WHERE "level" IS NULL;

-- Enforce the column from now on.
ALTER TABLE "Course" ALTER COLUMN "level" SET NOT NULL;
