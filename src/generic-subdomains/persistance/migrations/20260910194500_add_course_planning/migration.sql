CREATE TYPE "CoursePlanStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "CoursePlanTopicType" AS ENUM ('content', 'review', 'activity', 'assessment', 'project');

CREATE TABLE "CoursePlan" (
  "id" SERIAL NOT NULL, "classOfferingId" INTEGER NOT NULL, "syllabus" TEXT,
  "generalObjectives" TEXT, "methodology" TEXT, "assessmentCriteria" TEXT,
  "workloadMinutes" INTEGER, "status" "CoursePlanStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoursePlan_pkey" PRIMARY KEY ("id"), CONSTRAINT "CoursePlan_classOfferingId_key" UNIQUE ("classOfferingId")
);
CREATE TABLE "CoursePlanUnit" (
  "id" SERIAL NOT NULL, "coursePlanId" INTEGER NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT, "position" INTEGER NOT NULL, "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3),
  "workloadMinutes" INTEGER, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoursePlanUnit_pkey" PRIMARY KEY ("id"), CONSTRAINT "CoursePlanUnit_coursePlanId_position_key" UNIQUE ("coursePlanId", "position")
);
CREATE TABLE "CoursePlanTopic" (
  "id" SERIAL NOT NULL, "unitId" INTEGER NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "position" INTEGER NOT NULL, "type" "CoursePlanTopicType" NOT NULL DEFAULT 'content', "estimatedMinutes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoursePlanTopic_pkey" PRIMARY KEY ("id"), CONSTRAINT "CoursePlanTopic_unitId_position_key" UNIQUE ("unitId", "position")
);
ALTER TABLE "ClassSession" ADD COLUMN "coursePlanTopicId" INTEGER;
CREATE INDEX "ClassSession_coursePlanTopicId_idx" ON "ClassSession"("coursePlanTopicId");
ALTER TABLE "CoursePlan" ADD CONSTRAINT "CoursePlan_classOfferingId_fkey" FOREIGN KEY ("classOfferingId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoursePlanUnit" ADD CONSTRAINT "CoursePlanUnit_coursePlanId_fkey" FOREIGN KEY ("coursePlanId") REFERENCES "CoursePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoursePlanTopic" ADD CONSTRAINT "CoursePlanTopic_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CoursePlanUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_coursePlanTopicId_fkey" FOREIGN KEY ("coursePlanTopicId") REFERENCES "CoursePlanTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
