/*
  Warnings:

  - You are about to drop the column `PoemId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `poemId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_PoemId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "PoemId",
ADD COLUMN     "poemId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
