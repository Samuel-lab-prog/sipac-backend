/*
  Warnings:

  - The values [none] on the enum `friendshipStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "friendshipStatus_new" AS ENUM ('rejected', 'pending', 'accepted', 'blocked');
ALTER TABLE "Friendship" ALTER COLUMN "status" TYPE "friendshipStatus_new" USING ("status"::text::"friendshipStatus_new");
ALTER TYPE "friendshipStatus" RENAME TO "friendshipStatus_old";
ALTER TYPE "friendshipStatus_new" RENAME TO "friendshipStatus";
DROP TYPE "public"."friendshipStatus_old";
COMMIT;
