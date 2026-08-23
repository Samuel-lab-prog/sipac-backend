-- CreateTable
CREATE TABLE "StudentRegistrationCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentRegistrationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistrationCode_code_key" ON "StudentRegistrationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistrationCode_claimedByUserId_key" ON "StudentRegistrationCode"("claimedByUserId");

-- AddForeignKey
ALTER TABLE "StudentRegistrationCode" ADD CONSTRAINT "StudentRegistrationCode_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
