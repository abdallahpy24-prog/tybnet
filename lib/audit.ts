import { prisma } from "@/lib/prisma";

export async function auditLog(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      beforeJson: input.beforeJson === undefined ? undefined : JSON.parse(JSON.stringify(input.beforeJson)),
      afterJson: input.afterJson === undefined ? undefined : JSON.parse(JSON.stringify(input.afterJson))
    }
  });
}
