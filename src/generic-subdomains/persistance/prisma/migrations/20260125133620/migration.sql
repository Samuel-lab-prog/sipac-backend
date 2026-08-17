/*
  Warnings:

  - The primary key for the `PoemLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `PoemId` on the `PoemLike` table. All the data in the column will be lost.
  - Added the required column `poemId` to the `PoemLike` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PoemLike" DROP CONSTRAINT "PoemLike_PoemId_fkey";

-- AlterTable
ALTER TABLE "PoemLike" DROP CONSTRAINT "PoemLike_pkey",
DROP COLUMN "PoemId",
ADD COLUMN     "poemId" INTEGER NOT NULL,
ADD CONSTRAINT "PoemLike_pkey" PRIMARY KEY ("userId", "poemId");

-- AddForeignKey
ALTER TABLE "PoemLike" ADD CONSTRAINT "PoemLike_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
