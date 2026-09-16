export const ADMIN_PAGE_SIZE = 50;

export function parseAdminPage(value?: string) {
  const text = value ?? "1";
  if (!/^\d+$/.test(text)) return 1;
  const parsed = Number(text);

  if (!Number.isSafeInteger(parsed) || parsed < 1) return 1;

  return Math.min(parsed, 100_000);
}
