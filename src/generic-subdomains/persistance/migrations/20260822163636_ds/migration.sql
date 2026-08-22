/*
  Warnings:

  - Added the required column `academicPeriodId` to the `ClassOffering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `ClassOffering` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('morning', 'afternoon', 'evening', 'integral');

-- AlterTable
ALTER TABLE "ClassOffering" ADD COLUMN     "academicPeriodId" INTEGER NOT NULL,
ADD COLUMN     "shift" "Shift" NOT NULL;

-- CreateTable
CREATE TABLE "AcademicPeriod" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" SERIAL NOT NULL,
    "classOfferingId" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "topic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" SERIAL NOT NULL,
    "classSessionId" INTEGER NOT NULL,
    "studentProfileId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    "markedByProfessorProfileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicActivity" (
    "id" SERIAL NOT NULL,
    "classOfferingId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "createdByProfessorProfileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicActivityAttachment" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "contentType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicActivityAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicActivitySubmission" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "studentProfileId" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "grade" DECIMAL(5,2),
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicPeriod_code_key" ON "AcademicPeriod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicPeriod_year_term_key" ON "AcademicPeriod"("year", "term");

-- CreateIndex
CREATE INDEX "ClassSession_classOfferingId_startsAt_idx" ON "ClassSession"("classOfferingId", "startsAt");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentProfileId_status_idx" ON "AttendanceRecord"("studentProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_classSessionId_studentProfileId_key" ON "AttendanceRecord"("classSessionId", "studentProfileId");

-- CreateIndex
CREATE INDEX "AcademicActivity_classOfferingId_dueAt_idx" ON "AcademicActivity"("classOfferingId", "dueAt");

-- CreateIndex
CREATE INDEX "AcademicActivityAttachment_activityId_idx" ON "AcademicActivityAttachment"("activityId");

-- CreateIndex
CREATE INDEX "AcademicActivitySubmission_studentProfileId_submittedAt_idx" ON "AcademicActivitySubmission"("studentProfileId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicActivitySubmission_activityId_studentProfileId_key" ON "AcademicActivitySubmission"("activityId", "studentProfileId");

-- CreateIndex
CREATE INDEX "ClassOffering_academicPeriodId_shift_idx" ON "ClassOffering"("academicPeriodId", "shift");

-- AddForeignKey
ALTER TABLE "ClassOffering" ADD CONSTRAINT "ClassOffering_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classOfferingId_fkey" FOREIGN KEY ("classOfferingId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_markedByProfessorProfileId_fkey" FOREIGN KEY ("markedByProfessorProfileId") REFERENCES "ProfessorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicActivity" ADD CONSTRAINT "AcademicActivity_classOfferingId_fkey" FOREIGN KEY ("classOfferingId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicActivity" ADD CONSTRAINT "AcademicActivity_createdByProfessorProfileId_fkey" FOREIGN KEY ("createdByProfessorProfileId") REFERENCES "ProfessorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicActivityAttachment" ADD CONSTRAINT "AcademicActivityAttachment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "AcademicActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicActivitySubmission" ADD CONSTRAINT "AcademicActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "AcademicActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicActivitySubmission" ADD CONSTRAINT "AcademicActivitySubmission_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
