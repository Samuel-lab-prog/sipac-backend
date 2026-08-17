/*
  Warnings:

  - You are about to drop the column `toPoemId` on the `PoemDedication` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[poemId,toUserId]` on the table `PoemDedication` will be added. If there are existing duplicate values, this will fail.
  - Made the column `toUserId` on table `PoemDedication` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PoemDedication" DROP CONSTRAINT "PoemDedication_toPoemId_fkey";

-- DropForeignKey
ALTER TABLE "PoemDedication" DROP CONSTRAINT "PoemDedication_toUserId_fkey";

-- DropIndex
DROP INDEX "Poem_authorId_idx";

-- DropIndex
DROP INDEX "PoemDedication_toPoemId_idx";

-- DropIndex
DROP INDEX "PoemDedication_toUserId_idx";

-- AlterTable
ALTER TABLE "PoemDedication" DROP COLUMN "toPoemId",
ALTER COLUMN "toUserId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PoemDedication_poemId_toUserId_key" ON "PoemDedication"("poemId", "toUserId");

-- AddForeignKey
ALTER TABLE "PoemDedication" ADD CONSTRAINT "PoemDedication_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
