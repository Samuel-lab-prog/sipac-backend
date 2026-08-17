/*
  Warnings:

  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_FRIEND', 'NEW_FRIEND_REQUEST', 'POEM_LIKED', 'POEM_COMMENT_CREATED', 'POEM_COMMENT_REPLIED', 'POEM_DEDICATED');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "body",
DROP COLUMN "deletedAt",
DROP COLUMN "title",
ADD COLUMN     "actorId" INTEGER,
ADD COLUMN     "aggregatedCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "entityId" INTEGER,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_type_key" ON "UserNotificationSetting"("userId", "type");

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
