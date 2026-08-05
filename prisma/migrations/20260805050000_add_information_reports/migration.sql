ALTER TABLE "Provider" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Pharmacy" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Lab" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "CosmeticCenter" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);

CREATE TABLE "InformationReport" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entitySlug" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "fingerprint" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InformationReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InformationReport_status_createdAt_idx"
ON "InformationReport"("status", "createdAt");

CREATE INDEX "InformationReport_entityType_entityId_idx"
ON "InformationReport"("entityType", "entityId");

CREATE INDEX "InformationReport_fingerprint_createdAt_idx"
ON "InformationReport"("fingerprint", "createdAt");
