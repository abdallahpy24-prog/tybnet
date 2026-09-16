import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Backward-compatibility helper.
 * TybNet does not enforce a hard provider count ceiling in application code.
 */
export type ProviderSlotInput = {
  type: string;
  status: "ACTIVE" | "INACTIVE";
  areaId: string;
  specialtyId?: string | null;
  excludeId?: string;
};

export async function assertProviderCoverageSlot(
  _tx: Prisma.TransactionClient,
  _input: ProviderSlotInput
) {
  void _tx;
  void _input;
  return;
}

/**
 * Kept only so older call sites can continue to work while being upgraded.
 * This transaction helper does not enforce any count limit.
 */
export async function withSerializableProviderTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>
) {
  return prisma.$transaction(work);
}
