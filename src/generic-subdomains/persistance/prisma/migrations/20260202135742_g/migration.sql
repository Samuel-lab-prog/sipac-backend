/*
  Warnings:

  - The values [scheduled] on the enum `poemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "poemStatus_new" AS ENUM ('draft', 'published');
ALTER TABLE "public"."Poem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Poem" ALTER COLUMN "status" TYPE "poemStatus_new" USING ("status"::text::"poemStatus_new");
ALTER TYPE "poemStatus" RENAME TO "poemStatus_old";
ALTER TYPE "poemStatus_new" RENAME TO "poemStatus";
DROP TYPE "public"."poemStatus_old";
ALTER TABLE "Poem" ALTER COLUMN "status" SET DEFAULT 'published';
COMMIT;
