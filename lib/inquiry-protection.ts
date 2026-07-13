import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";

const INQUIRY_WINDOW_MS = 5 * 60 * 1000;

type InquiryEntity = "Pharmacy" | "Lab" | "CosmeticCenter";

function readClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor
    ?.split(",")[0]
    ?.trim();

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedIp ||
    null
  );
}

export function getInquiryFingerprint(request: Request) {
  const ip = readClientIp(request);

  if (!ip) {
    return null;
  }

  const userAgent = request.headers.get("user-agent")?.trim() || "unknown";
  const salt =
    process.env.AUTH_SECRET ||
    process.env.PUBLIC_SITE_URL ||
    "tybnet-inquiry-fingerprint";

  return createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}`)
    .digest("hex");
}

export async function inquiryWasRecentlyCounted(
  tx: Prisma.TransactionClient,
  input: {
    entity: InquiryEntity;
    entityId: string;
    fingerprint: string | null;
  }
) {
  if (!input.fingerprint) {
    return false;
  }

  const action = "create-public-inquiry";
  const lockKey = [
    "inquiry",
    input.entity,
    input.entityId,
    input.fingerprint
  ].join(":");

  await tx.$queryRaw`
    SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
  `;

  const windowStart = new Date(Date.now() - INQUIRY_WINDOW_MS);

  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "AuditLog"
    WHERE "action" = ${action}
      AND "entity" = ${input.entity}
      AND "entityId" = ${input.entityId}
      AND "createdAt" >= ${windowStart}
      AND "afterJson"->>'fingerprint' = ${input.fingerprint}
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function recordInquiry(
  tx: Prisma.TransactionClient,
  input: {
    entity: InquiryEntity;
    entityId: string;
    fingerprint: string | null;
    inquiryCount: number;
    source: string;
  }
) {
  await tx.auditLog.create({
    data: {
      userId: null,
      action: "create-public-inquiry",
      entity: input.entity,
      entityId: input.entityId,
      afterJson: {
        fingerprint: input.fingerprint,
        inquiryCount: input.inquiryCount,
        source: input.source
      }
    }
  });
}
