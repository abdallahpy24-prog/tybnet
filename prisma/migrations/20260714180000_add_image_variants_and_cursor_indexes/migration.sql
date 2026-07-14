BEGIN;

-- Keep the existing imageUrl column as the optimized profile image.
-- The two new nullable columns preserve compatibility with every existing row.
ALTER TABLE "Provider"
  ADD COLUMN IF NOT EXISTS "imageThumbnailUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imageOriginalUrl" TEXT;

ALTER TABLE "Pharmacy"
  ADD COLUMN IF NOT EXISTS "imageThumbnailUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imageOriginalUrl" TEXT;

ALTER TABLE "Lab"
  ADD COLUMN IF NOT EXISTS "imageThumbnailUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imageOriginalUrl" TEXT;

ALTER TABLE "CosmeticCenter"
  ADD COLUMN IF NOT EXISTS "imageThumbnailUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imageOriginalUrl" TEXT;

-- Replace the shorter provider indexes with indexes that support stable
-- keyset/cursor pagination using bookingPoints, updatedAt, and id.
DROP INDEX IF EXISTS "Provider_type_status_bookingPoints_idx";
DROP INDEX IF EXISTS "Provider_type_status_isFeatured_idx";

CREATE INDEX IF NOT EXISTS "Provider_type_status_bookingPoints_updatedAt_id_idx"
  ON "Provider"("type", "status", "bookingPoints", "updatedAt", "id");

CREATE INDEX IF NOT EXISTS "Provider_type_status_isFeatured_bookingPoints_updatedAt_id_idx"
  ON "Provider"("type", "status", "isFeatured", "bookingPoints", "updatedAt", "id");

-- Replace the shorter service-place indexes with stable cursor indexes.
DROP INDEX IF EXISTS "Pharmacy_status_inquiryCount_idx";

CREATE INDEX IF NOT EXISTS "Pharmacy_status_inquiryCount_updatedAt_id_idx"
  ON "Pharmacy"("status", "inquiryCount", "updatedAt", "id");

DROP INDEX IF EXISTS "Lab_status_inquiryCount_idx";

CREATE INDEX IF NOT EXISTS "Lab_status_inquiryCount_updatedAt_id_idx"
  ON "Lab"("status", "inquiryCount", "updatedAt", "id");

DROP INDEX IF EXISTS "CosmeticCenter_status_inquiryCount_idx";

CREATE INDEX IF NOT EXISTS "CosmeticCenter_status_inquiryCount_updatedAt_id_idx"
  ON "CosmeticCenter"("status", "inquiryCount", "updatedAt", "id");

COMMIT;
