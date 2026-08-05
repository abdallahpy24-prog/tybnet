-- Track whether a published offer has already triggered its one-time push notification.
ALTER TABLE "Offer"
ADD COLUMN "pushNotifiedAt" TIMESTAMP(3);

-- Do not treat offers that existed before this feature as newly published.
UPDATE "Offer"
SET "pushNotifiedAt" = CURRENT_TIMESTAMP
WHERE "isActive" = true;

-- Store only the minimum device data required for optional offer notifications.
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "offersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "appVersion" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_installationId_key"
ON "PushSubscription"("installationId");

CREATE UNIQUE INDEX "PushSubscription_expoPushToken_key"
ON "PushSubscription"("expoPushToken");

CREATE INDEX "PushSubscription_offersEnabled_updatedAt_idx"
ON "PushSubscription"("offersEnabled", "updatedAt");

CREATE INDEX "PushSubscription_lastSeenAt_idx"
ON "PushSubscription"("lastSeenAt");
