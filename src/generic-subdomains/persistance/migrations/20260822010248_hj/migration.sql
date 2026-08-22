/*
  Warnings:

  - The values [author,moderator] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rg]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[academicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('student', 'professor', 'staff', 'admin');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
ADD COLUMN     "academicId" TEXT,
ADD COLUMN     "admissionYear" INTEGER,
ADD COLUMN     "campus" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "rg" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'student';

-- CreateIndex
CREATE UNIQUE INDEX "User_rg_key" ON "User"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_academicId_key" ON "User"("academicId");
