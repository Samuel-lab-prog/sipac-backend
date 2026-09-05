/*
  Warnings:

  - You are about to alter the column `familyIncome` on the `StudentProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "familyIncome" SET DATA TYPE DOUBLE PRECISION;
