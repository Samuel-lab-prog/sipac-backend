-- AlterTable
ALTER TABLE "StudentRegistration" RENAME CONSTRAINT "StudentRegistrationCode_pkey" TO "StudentRegistration_pkey";

-- RenameIndex
ALTER INDEX "StudentRegistrationCode_cpf_key" RENAME TO "StudentRegistration_cpf_key";
