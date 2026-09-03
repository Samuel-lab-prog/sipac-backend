CREATE TABLE "AcademicActivitySubmissionAttachment" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "contentType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicActivitySubmissionAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AcademicActivitySubmissionAttachment_submissionId_idx" ON "AcademicActivitySubmissionAttachment"("submissionId");

ALTER TABLE "AcademicActivitySubmissionAttachment" ADD CONSTRAINT "AcademicActivitySubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AcademicActivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
