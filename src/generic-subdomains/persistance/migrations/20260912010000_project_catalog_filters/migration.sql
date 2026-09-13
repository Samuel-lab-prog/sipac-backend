-- Project catalog metadata used by the advanced search and institutional reports.
CREATE TYPE "ProjectOrigin" AS ENUM ('internal', 'external');
CREATE TYPE "ProjectFinalReportStatus" AS ENUM ('not_submitted', 'submitted', 'approved');

ALTER TABLE "InstitutionalProject"
    ADD COLUMN "departmentId" INTEGER,
    ADD COLUMN "code" TEXT,
    ADD COLUMN "year" INTEGER,
    ADD COLUMN "origin" "ProjectOrigin" NOT NULL DEFAULT 'internal',
    ADD COLUMN "researchLine" TEXT,
    ADD COLUMN "knowledgeArea" TEXT,
    ADD COLUMN "researchGroup" TEXT,
    ADD COLUMN "fundingAgency" TEXT,
    ADD COLUMN "callName" TEXT,
    ADD COLUMN "nature" TEXT,
    ADD COLUMN "researchType" TEXT,
    ADD COLUMN "finalReportStatus" "ProjectFinalReportStatus" NOT NULL DEFAULT 'not_submitted';

UPDATE "InstitutionalProject"
SET
    "code" = 'LEGACY-' || LPAD("id"::text, 6, '0') || '-' || EXTRACT(YEAR FROM "startsAt")::integer::text,
    "year" = EXTRACT(YEAR FROM "startsAt")::integer,
    "finalReportStatus" = CASE
        WHEN EXISTS (
            SELECT 1 FROM "ProjectReport" r
            WHERE r."projectId" = "InstitutionalProject"."id" AND r."approved" = true
        ) THEN 'approved'::"ProjectFinalReportStatus"
        WHEN EXISTS (
            SELECT 1 FROM "ProjectReport" r
            WHERE r."projectId" = "InstitutionalProject"."id"
        ) THEN 'submitted'::"ProjectFinalReportStatus"
        ELSE 'not_submitted'::"ProjectFinalReportStatus"
    END;

ALTER TABLE "InstitutionalProject"
    ALTER COLUMN "code" SET NOT NULL,
    ALTER COLUMN "year" SET NOT NULL;

CREATE UNIQUE INDEX "InstitutionalProject_code_key" ON "InstitutionalProject"("code");
CREATE INDEX "InstitutionalProject_campusId_kind_origin_year_idx"
    ON "InstitutionalProject"("campusId", "kind", "origin", "year");
CREATE INDEX "InstitutionalProject_campusId_status_year_createdAt_idx"
    ON "InstitutionalProject"("campusId", "status", "year", "createdAt");

ALTER TABLE "InstitutionalProject"
    ADD CONSTRAINT "InstitutionalProject_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
