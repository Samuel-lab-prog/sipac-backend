/*
  Warnings:

  - The `entityType` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('POEM', 'COMMENT', 'USER');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "Entity";
