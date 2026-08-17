-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('SUSPENSION', 'BAN');

-- CreateTable
CREATE TABLE "UserSanction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "SanctionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),
    "moderatorId" INTEGER NOT NULL,

    CONSTRAINT "UserSanction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSanction_userId_idx" ON "UserSanction"("userId");

-- CreateIndex
CREATE INDEX "UserSanction_startAt_idx" ON "UserSanction"("startAt");

-- AddForeignKey
ALTER TABLE "UserSanction" ADD CONSTRAINT "UserSanction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSanction" ADD CONSTRAINT "UserSanction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
