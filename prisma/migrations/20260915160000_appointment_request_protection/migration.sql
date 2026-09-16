-- Adds normalized-phone and idempotency fields without rewriting existing appointment data.
ALTER TABLE "Appointment"
ADD COLUMN "patientPhoneNormalized" TEXT,
ADD COLUMN "requestKey" TEXT;

CREATE UNIQUE INDEX "Appointment_requestKey_key"
ON "Appointment"("requestKey");

CREATE INDEX "Appointment_patientPhoneNormalized_createdAt_idx"
ON "Appointment"("patientPhoneNormalized", "createdAt");

CREATE INDEX "Appointment_providerId_patientPhoneNormalized_createdAt_idx"
ON "Appointment"("providerId", "patientPhoneNormalized", "createdAt");
