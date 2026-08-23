-- AlterTable
ALTER TABLE "StudentRegistrationCode" ADD COLUMN "cpf" TEXT;

-- Backfill is not possible generically. The column becomes mandatory after the data is populated.

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistrationCode_cpf_key" ON "StudentRegistrationCode"("cpf");

-- AlterTable
ALTER TABLE "StudentRegistrationCode" ALTER COLUMN "cpf" SET NOT NULL;
