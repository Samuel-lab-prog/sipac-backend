CREATE TABLE "AcademicActivitySubmissionComment" (
  "id" SERIAL NOT NULL,
  "submissionId" INTEGER NOT NULL,
  "authorUserId" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicActivitySubmissionComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AcademicActivitySubmissionComment_submissionId_createdAt_idx"
  ON "AcademicActivitySubmissionComment"("submissionId", "createdAt");
CREATE INDEX "AcademicActivitySubmissionComment_authorUserId_createdAt_idx"
  ON "AcademicActivitySubmissionComment"("authorUserId", "createdAt");

ALTER TABLE "AcademicActivitySubmissionComment"
  ADD CONSTRAINT "AcademicActivitySubmissionComment_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "AcademicActivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicActivitySubmissionComment"
  ADD CONSTRAINT "AcademicActivitySubmissionComment_authorUserId_fkey"
  FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
