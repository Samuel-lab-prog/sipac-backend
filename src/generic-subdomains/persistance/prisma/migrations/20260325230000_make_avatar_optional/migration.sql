-- Make avatarUrl optional for users without an avatar
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL;
