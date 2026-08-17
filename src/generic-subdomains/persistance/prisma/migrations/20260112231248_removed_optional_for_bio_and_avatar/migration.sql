/*
  Warnings:

  - Made the column `bio` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET NOT NULL;
