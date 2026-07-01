-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "bookingPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Appointment_providerId_idx" ON "Appointment"("providerId");

-- CreateIndex
CREATE INDEX "Appointment_status_createdAt_idx" ON "Appointment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Appointment_preferredDate_idx" ON "Appointment"("preferredDate");

-- CreateIndex
CREATE INDEX "Area_governorateId_isActive_sortOrder_idx" ON "Area"("governorateId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Governorate_isActive_sortOrder_idx" ON "Governorate"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Lab_status_isFeatured_idx" ON "Lab"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "Lab_createdAt_idx" ON "Lab"("createdAt");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Offer_providerId_idx" ON "Offer"("providerId");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Pharmacy_status_isFeatured_idx" ON "Pharmacy"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "Pharmacy_createdAt_idx" ON "Pharmacy"("createdAt");

-- CreateIndex
CREATE INDEX "Provider_type_status_isFeatured_bookingPoints_idx" ON "Provider"("type", "status", "isFeatured", "bookingPoints");

-- CreateIndex
CREATE INDEX "Provider_status_sortOrder_idx" ON "Provider"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Provider_createdAt_idx" ON "Provider"("createdAt");

-- CreateIndex
CREATE INDEX "Specialty_forType_isActive_idx" ON "Specialty"("forType", "isActive");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
