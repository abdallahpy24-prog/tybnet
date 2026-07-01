import { prisma } from "@/lib/prisma";

type AuditLogInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
};

function toJsonValue(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

export async function auditLog(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      beforeJson: toJsonValue(input.beforeJson),
      afterJson: toJsonValue(input.afterJson)
    }
  });
}