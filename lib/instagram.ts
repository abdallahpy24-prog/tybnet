export function normalizeInstagram(input?: string | null) {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;

  const handle = value.replace(/^@/, "").replace(/^instagram\.com\//i, "").replace(/^www\.instagram\.com\//i, "");
  if (!handle) return null;
  return "https://instagram.com/" + handle.replace(/\/$/, "");
}

export function instagramLabel(url?: string | null) {
  if (!url) return null;
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}
