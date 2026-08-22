-- DropIndex
DROP INDEX "User_academicId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "academicId",
DROP COLUMN "admissionYear",
DROP COLUMN "campus",
DROP COLUMN "course",
DROP COLUMN "department";
