/*
  Warnings:

  - The values [SUSPENSION,BAN] on the enum `SanctionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `Friendship` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SanctionType_new" AS ENUM ('suspension', 'ban');
ALTER TABLE "UserSanction" ALTER COLUMN "type" TYPE "SanctionType_new" USING ("type"::text::"SanctionType_new");
ALTER TYPE "SanctionType" RENAME TO "SanctionType_old";
ALTER TYPE "SanctionType_new" RENAME TO "SanctionType";
DROP TYPE "public"."SanctionType_old";
COMMIT;

-- DropIndex
DROP INDEX "Friendship_userAId_status_idx";

-- DropIndex
DROP INDEX "Friendship_userBId_status_idx";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "status";

-- DropEnum
DROP TYPE "friendshipStatus";

-- CreateTable
CREATE TABLE "FriendshipRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "addresseeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedFriend" (
    "id" SERIAL NOT NULL,
    "blockerId" INTEGER NOT NULL,
    "blockedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedFriend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendshipRequest_requesterId_addresseeId_key" ON "FriendshipRequest"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "BlockedFriend_blockerId_idx" ON "BlockedFriend"("blockerId");

-- CreateIndex
CREATE INDEX "BlockedFriend_blockedId_idx" ON "BlockedFriend"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedFriend_blockerId_blockedId_key" ON "BlockedFriend"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "Comment_poemId_idx" ON "Comment"("poemId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");

-- AddForeignKey
ALTER TABLE "FriendshipRequest" ADD CONSTRAINT "FriendshipRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendshipRequest" ADD CONSTRAINT "FriendshipRequest_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedFriend" ADD CONSTRAINT "BlockedFriend_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedFriend" ADD CONSTRAINT "BlockedFriend_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
