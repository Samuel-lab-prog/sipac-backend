BEGIN;
-- CreateEnum
CREATE TYPE "InstitutionalProjectKind" AS ENUM ('teaching', 'research', 'extension');

-- CreateEnum
CREATE TYPE "InstitutionalProjectStatus" AS ENUM ('draft', 'submitted', 'active', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "campusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "AcademicPeriod" ADD COLUMN     "campusId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Institution" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "configured" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionalProject" (
    "id" SERIAL NOT NULL,
    "campusId" INTEGER NOT NULL,
    "coordinatorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "InstitutionalProjectKind" NOT NULL,
    "objectives" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "InstitutionalProjectStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionalProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectParticipant" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "workPlan" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "approvedHours" INTEGER,
    "hoursApprovedBy" INTEGER,
    "hoursApprovedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectReport" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEvent" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuedDocument" (
    "id" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "campusId" INTEGER NOT NULL,
    "subjectUserId" INTEGER NOT NULL,
    "issuedByUserId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedByUserId" INTEGER,
    "revocationReason" TEXT,

    CONSTRAINT "IssuedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstitutionalProject_campusId_status_createdAt_idx" ON "InstitutionalProject"("campusId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectParticipant_projectId_userId_key" ON "ProjectParticipant"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectReport_projectId_createdAt_idx" ON "ProjectReport"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectEvent_projectId_createdAt_idx" ON "ProjectEvent"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedDocument_verificationCode_key" ON "IssuedDocument"("verificationCode");

-- CreateIndex
CREATE INDEX "IssuedDocument_subjectUserId_createdAt_idx" ON "IssuedDocument"("subjectUserId", "createdAt");

-- CreateIndex
CREATE INDEX "IssuedDocument_campusId_createdAt_idx" ON "IssuedDocument"("campusId", "createdAt");

INSERT INTO "Institution" ("id", "name", "acronym", "configured", "updatedAt") VALUES (1, 'Instituição não configurada', 'AGIAS', false, CURRENT_TIMESTAMP);
INSERT INTO "Campus" ("id", "institutionId", "name", "city", "state", "address") VALUES (1, 1, 'Campus inicial', '', '', '');
SELECT setval(pg_get_serial_sequence('"Institution"', 'id'), 1, true);
SELECT setval(pg_get_serial_sequence('"Campus"', 'id'), 1, true);
ALTER TABLE "InstitutionalProject" ADD CONSTRAINT "project_valid_dates" CHECK ("endsAt" >= "startsAt");
ALTER TABLE "ProjectParticipant" ADD CONSTRAINT "participant_valid_dates" CHECK ("endsAt" >= "startsAt");
ALTER TABLE "ProjectParticipant" ADD CONSTRAINT "participant_valid_hours" CHECK ("approvedHours" IS NULL OR "approvedHours" BETWEEN 0 AND 10000);
-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicPeriod" ADD CONSTRAINT "AcademicPeriod_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalProject" ADD CONSTRAINT "InstitutionalProject_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalProject" ADD CONSTRAINT "InstitutionalProject_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParticipant" ADD CONSTRAINT "ProjectParticipant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "InstitutionalProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParticipant" ADD CONSTRAINT "ProjectParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectReport" ADD CONSTRAINT "ProjectReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "InstitutionalProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "InstitutionalProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedDocument" ADD CONSTRAINT "IssuedDocument_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
