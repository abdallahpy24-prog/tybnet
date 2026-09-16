import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Backward-compatibility helper.
 * TybNet does not enforce a hard service-place count ceiling in application code.
 */
export type PlaceSlotInput = {
  kind: string;
  status: "ACTIVE" | "INACTIVE";
  areaId: string;
  excludeId?: string;
};

export async function assertServicePlaceAreaSlot(
  _tx: Prisma.TransactionClient,
  _input: PlaceSlotInput
) {
  void _tx;
  void _input;
  return;
}

/**
 * Kept only so older call sites can continue to work while being upgraded.
 * This transaction helper does not enforce any count limit.
 */
export async function withSerializableServicePlaceTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>
) {
  return prisma.$transaction(work);
}
