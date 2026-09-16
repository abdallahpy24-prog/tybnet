/** Matches Next Image's configured sources, so old unsupported URLs cannot break a page. */
export function normalizeDisplayImageUrl(value?: string | null) {
  const text = value?.trim();
  if (!text || /[\u0000-\u001f\u007f\\]/.test(text)) return null;
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const storage = /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname) &&
      url.pathname.startsWith("/storage/v1/object/public/");
    const blob = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname);
    return storage || blob ? url.toString() : null;
  } catch {
    return null;
  }
}
