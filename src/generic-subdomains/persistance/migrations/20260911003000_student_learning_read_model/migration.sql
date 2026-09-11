-- Additive migration: preserves historical lessons and their free-text topics.
CREATE TYPE "LessonStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed');
CREATE TYPE "AcademicActivityKind" AS ENUM ('activity', 'assessment');
ALTER TABLE "ClassSession"
 ADD COLUMN "status" "LessonStatus" NOT NULL DEFAULT 'scheduled',
 ADD COLUMN "deliveredContent" TEXT,
 ADD COLUMN "room" TEXT,
 ADD COLUMN "publicNotes" TEXT,
 ADD COLUMN "replacesSessionId" INTEGER;
CREATE UNIQUE INDEX "ClassSession_replacesSessionId_key" ON "ClassSession"("replacesSessionId");
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_replacesSessionId_fkey" FOREIGN KEY ("replacesSessionId") REFERENCES "ClassSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "ClassSessionMaterial" (
 "id" SERIAL NOT NULL,
 "classSessionId" INTEGER NOT NULL,
 "title" TEXT NOT NULL,
 "url" TEXT NOT NULL,
 CONSTRAINT "ClassSessionMaterial_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClassSessionMaterial_classSessionId_url_key" ON "ClassSessionMaterial"("classSessionId", "url");
ALTER TABLE "ClassSessionMaterial" ADD CONSTRAINT "ClassSessionMaterial_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicActivity"
 ADD COLUMN "kind" "AcademicActivityKind" NOT NULL DEFAULT 'activity',
 ADD COLUMN "assessmentType" TEXT,
 ADD COLUMN "appliesAt" TIMESTAMP(3),
 ADD COLUMN "maxGrade" DOUBLE PRECISION,
 ADD COLUMN "weight" DOUBLE PRECISION,
 ADD COLUMN "coursePlanUnitId" INTEGER,
 ADD COLUMN "coursePlanTopicId" INTEGER,
 ADD COLUMN "classSessionId" INTEGER;
ALTER TABLE "AcademicActivity" ADD CONSTRAINT "AcademicActivity_coursePlanUnitId_fkey" FOREIGN KEY ("coursePlanUnitId") REFERENCES "CoursePlanUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicActivity" ADD CONSTRAINT "AcademicActivity_coursePlanTopicId_fkey" FOREIGN KEY ("coursePlanTopicId") REFERENCES "CoursePlanTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicActivity" ADD CONSTRAINT "AcademicActivity_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
