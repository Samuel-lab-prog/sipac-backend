-- Rename the legacy registration table to the canonical name used by the codebase.
ALTER TABLE "StudentRegistrationCode" RENAME TO "StudentRegistration";

-- Rename columns to match the new domain vocabulary.
ALTER TABLE "StudentRegistration" RENAME COLUMN "code" TO "academicId";
ALTER TABLE "StudentRegistration" RENAME COLUMN "claimedByUserId" TO "userId";
ALTER TABLE "StudentRegistration" RENAME COLUMN "claimedAt" TO "activatedAt";

-- Keep the cpf column normalized and required.
ALTER TABLE "StudentRegistration" ALTER COLUMN "cpf" SET NOT NULL;

-- Preserve the unique constraints after the rename.
ALTER INDEX "StudentRegistrationCode_code_key" RENAME TO "StudentRegistration_academicId_key";
ALTER INDEX "StudentRegistrationCode_claimedByUserId_key" RENAME TO "StudentRegistration_userId_key";

-- Rename the foreign key created by the legacy migration.
ALTER TABLE "StudentRegistration"
  RENAME CONSTRAINT "StudentRegistrationCode_claimedByUserId_fkey" TO "StudentRegistration_userId_fkey";
