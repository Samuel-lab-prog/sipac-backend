-- CreateEnum
CREATE TYPE "AcademicCalendarEventType" AS ENUM ('holiday', 'academic_event', 'instructional_saturday', 'exam', 'break');

-- CreateTable
CREATE TABLE "AcademicCalendarEvent" (
    "id" SERIAL NOT NULL,
    "academicPeriodId" INTEGER NOT NULL,
    "type" "AcademicCalendarEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "isInstructionalDay" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicCalendarEvent_academicPeriodId_startsAt_idx" ON "AcademicCalendarEvent"("academicPeriodId", "startsAt");
CREATE INDEX "AcademicCalendarEvent_type_startsAt_idx" ON "AcademicCalendarEvent"("type", "startsAt");

-- AddForeignKey
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
