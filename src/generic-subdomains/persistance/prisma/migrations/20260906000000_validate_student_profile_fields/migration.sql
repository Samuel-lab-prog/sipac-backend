UPDATE "StudentProfile"
SET "birthplace" = split_part("birthplace", '/', 1)
WHERE "birthplace" LIKE '%/%';

ALTER TABLE "StudentProfile"
  ADD CONSTRAINT "StudentProfile_birthplace_city_only"
    CHECK ("birthplace" IS NULL OR "birthplace" !~ '/'),
  ADD CONSTRAINT "StudentProfile_postalCode_format"
    CHECK ("postalCode" IS NULL OR "postalCode" ~ '^[0-9]{5}-?[0-9]{3}$'),
  ADD CONSTRAINT "StudentProfile_state_format"
    CHECK ("state" IS NULL OR "state" ~ '^[A-Z]{2}$');
