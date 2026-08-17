/*
  Warnings:

  - The `status` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `toPoemId` on the `Poem` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Poem` table. All the data in the column will be lost.
  - The `status` column on the `Poem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `visibility` column on the `Poem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `moderationStatus` column on the `Poem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('author', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'suspended');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('visible', 'deletedByAuthor', 'deletedByModerator');

-- CreateEnum
CREATE TYPE "PoemStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "PoemVisibility" AS ENUM ('public', 'private', 'unlisted', 'friends');

-- CreateEnum
CREATE TYPE "PoemModerationStatus" AS ENUM ('pending', 'approved', 'rejected', 'removed');

-- DropForeignKey
ALTER TABLE "Poem" DROP CONSTRAINT "Poem_toPoemId_fkey";

-- DropForeignKey
ALTER TABLE "Poem" DROP CONSTRAINT "Poem_toUserId_fkey";

-- DropIndex
DROP INDEX "BlockedUser_blockedId_idx";

-- DropIndex
DROP INDEX "BlockedUser_blockerId_idx";

-- DropIndex
DROP INDEX "UserSanction_startAt_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "status",
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'visible';

-- AlterTable
ALTER TABLE "Poem" DROP COLUMN "toPoemId",
DROP COLUMN "toUserId",
DROP COLUMN "status",
ADD COLUMN     "status" "PoemStatus" NOT NULL DEFAULT 'draft',
DROP COLUMN "visibility",
ADD COLUMN     "visibility" "PoemVisibility" NOT NULL DEFAULT 'public',
DROP COLUMN "moderationStatus",
ADD COLUMN     "moderationStatus" "PoemModerationStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'author',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';

-- DropEnum
DROP TYPE "commentStatus";

-- DropEnum
DROP TYPE "poemModerationStatus";

-- DropEnum
DROP TYPE "poemStatus";

-- DropEnum
DROP TYPE "poemVisibility";

-- DropEnum
DROP TYPE "userRole";

-- DropEnum
DROP TYPE "userStatus";

-- CreateTable
CREATE TABLE "PoemDedication" (
    "id" SERIAL NOT NULL,
    "poemId" INTEGER NOT NULL,
    "toUserId" INTEGER,
    "toPoemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoemDedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoemDedication_poemId_idx" ON "PoemDedication"("poemId");

-- CreateIndex
CREATE INDEX "PoemDedication_toUserId_idx" ON "PoemDedication"("toUserId");

-- CreateIndex
CREATE INDEX "PoemDedication_toPoemId_idx" ON "PoemDedication"("toPoemId");

-- CreateIndex
CREATE INDEX "Poem_status_visibility_idx" ON "Poem"("status", "visibility");

-- AddForeignKey
ALTER TABLE "PoemDedication" ADD CONSTRAINT "PoemDedication_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoemDedication" ADD CONSTRAINT "PoemDedication_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoemDedication" ADD CONSTRAINT "PoemDedication_toPoemId_fkey" FOREIGN KEY ("toPoemId") REFERENCES "Poem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
