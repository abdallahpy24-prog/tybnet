import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSettingsMap = cache(async () => {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""]));
});

export async function getSetting(key: string, fallback = "") {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}
