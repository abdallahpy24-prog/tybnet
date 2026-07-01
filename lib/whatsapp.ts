export function normalizeIraqWhatsapp(input?: string | null) {
  if (!input) return null;

  const digits = input.replace(/[\s+\-().]/g, "");

  if (/^07\d{9}$/.test(digits)) {
    return "964" + digits.slice(1);
  }

  if (/^7\d{9}$/.test(digits)) {
    return "964" + digits;
  }

  if (/^9647\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

export function buildWhatsappUrl(
  number?: string | null,
  message = "مرحبا، وصلت لكم من منصة طب نت وأرغب بالاستفسار."
) {
  const normalized = normalizeIraqWhatsapp(number);

  if (!normalized) return null;

  return "https://wa.me/" + normalized + "?text=" + encodeURIComponent(message);
}