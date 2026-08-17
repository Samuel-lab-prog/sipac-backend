/*
  Warnings:

  - You are about to drop the column `addresseeId` on the `Poem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Poem" DROP CONSTRAINT "Poem_addresseeId_fkey";

-- AlterTable
ALTER TABLE "Poem" DROP COLUMN "addresseeId",
ADD COLUMN     "toUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Poem" ADD CONSTRAINT "Poem_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
