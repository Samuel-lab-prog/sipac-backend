ALTER TABLE "StudentProfile" RENAME COLUMN "socioeconomicStatus" TO "familyIncomeRange";

CREATE TYPE "FamilyIncomeRange" AS ENUM (
  'ATE_0_5_SM', 'DE_0_5_A_1_SM', 'DE_1_A_2_SM', 'DE_2_A_3_SM',
  'DE_3_A_5_SM', 'ACIMA_DE_5_SM', 'NAO_DECLARADA', 'PREFIRO_NAO_INFORMAR'
);

ALTER TABLE "StudentProfile"
  ALTER COLUMN "familyIncomeRange" TYPE "FamilyIncomeRange"
  USING CASE "familyIncomeRange"
    WHEN 'Não declarada' THEN 'NAO_DECLARADA'::"FamilyIncomeRange"
    ELSE NULL
  END;

ALTER TABLE "StudentProfile" DROP COLUMN "familyIncome";
