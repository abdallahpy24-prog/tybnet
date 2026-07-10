-- Add cosmetic doctors to the existing provider system
ALTER TYPE "ProviderType"
ADD VALUE IF NOT EXISTS 'COSMETIC_DOCTOR';

-- Add cosmetic doctor specialties
ALTER TYPE "SpecialtyFor"
ADD VALUE IF NOT EXISTS 'COSMETIC_DOCTOR';

-- Keep the database default aligned with schema.prisma
ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'EDITOR';

-- Align older database columns with the current Prisma schema
ALTER TABLE "Provider"
ADD COLUMN IF NOT EXISTS "mapurl" TEXT;

ALTER TABLE "Pharmacy"
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "services" TEXT,
ADD COLUMN IF NOT EXISTS "mapurl" TEXT,
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "inquiryCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Lab"
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "mapurl" TEXT,
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "inquiryCount" INTEGER NOT NULL DEFAULT 0;

-- Ensure older rows and column defaults are valid
UPDATE "Pharmacy"
SET "sortOrder" = 0
WHERE "sortOrder" IS NULL;

UPDATE "Pharmacy"
SET "inquiryCount" = 0
WHERE "inquiryCount" IS NULL;

UPDATE "Lab"
SET "sortOrder" = 0
WHERE "sortOrder" IS NULL;

UPDATE "Lab"
SET "inquiryCount" = 0
WHERE "inquiryCount" IS NULL;

ALTER TABLE "Pharmacy"
ALTER COLUMN "sortOrder" SET DEFAULT 0,
ALTER COLUMN "sortOrder" SET NOT NULL,
ALTER COLUMN "inquiryCount" SET DEFAULT 0,
ALTER COLUMN "inquiryCount" SET NOT NULL;

ALTER TABLE "Lab"
ALTER COLUMN "sortOrder" SET DEFAULT 0,
ALTER COLUMN "sortOrder" SET NOT NULL,
ALTER COLUMN "inquiryCount" SET DEFAULT 0,
ALTER COLUMN "inquiryCount" SET NOT NULL;

-- Create cosmetic centers
CREATE TABLE "CosmeticCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "bio" TEXT,
    "services" TEXT,
    "address" TEXT,
    "mapurl" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "instagramUrl" TEXT,
    "imageUrl" TEXT,
    "workingHours" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CosmeticCenter_pkey" PRIMARY KEY ("id")
);

-- Cosmetic center indexes
CREATE UNIQUE INDEX "CosmeticCenter_slug_key"
ON "CosmeticCenter"("slug");

CREATE INDEX "CosmeticCenter_status_governorateId_areaId_idx"
ON "CosmeticCenter"("status", "governorateId", "areaId");

CREATE INDEX "CosmeticCenter_status_isFeatured_idx"
ON "CosmeticCenter"("status", "isFeatured");

CREATE INDEX "CosmeticCenter_status_isFeatured_inquiryCount_idx"
ON "CosmeticCenter"("status", "isFeatured", "inquiryCount");

CREATE INDEX "CosmeticCenter_status_sortOrder_idx"
ON "CosmeticCenter"("status", "sortOrder");

CREATE INDEX "CosmeticCenter_inquiryCount_idx"
ON "CosmeticCenter"("inquiryCount");

CREATE INDEX "CosmeticCenter_createdAt_idx"
ON "CosmeticCenter"("createdAt");

-- Missing pharmacy indexes
CREATE INDEX IF NOT EXISTS "Pharmacy_status_isFeatured_inquiryCount_idx"
ON "Pharmacy"("status", "isFeatured", "inquiryCount");

CREATE INDEX IF NOT EXISTS "Pharmacy_status_sortOrder_idx"
ON "Pharmacy"("status", "sortOrder");

CREATE INDEX IF NOT EXISTS "Pharmacy_inquiryCount_idx"
ON "Pharmacy"("inquiryCount");

-- Missing lab indexes
CREATE INDEX IF NOT EXISTS "Lab_status_isFeatured_inquiryCount_idx"
ON "Lab"("status", "isFeatured", "inquiryCount");

CREATE INDEX IF NOT EXISTS "Lab_status_sortOrder_idx"
ON "Lab"("status", "sortOrder");

CREATE INDEX IF NOT EXISTS "Lab_inquiryCount_idx"
ON "Lab"("inquiryCount");

-- Cosmetic center relations
ALTER TABLE "CosmeticCenter"
ADD CONSTRAINT "CosmeticCenter_governorateId_fkey"
FOREIGN KEY ("governorateId")
REFERENCES "Governorate"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "CosmeticCenter"
ADD CONSTRAINT "CosmeticCenter_areaId_fkey"
FOREIGN KEY ("areaId")
REFERENCES "Area"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;