const TRUSTED_MAP_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
  "maps.apple.com",
  "waze.com",
  "www.waze.com"
]);

function toUrl(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return new URL(trimmed);
  }

  return new URL(`https://${trimmed}`);
}

function hasSafeGooglePath(url: URL) {
  if (url.hostname === "maps.google.com" || url.hostname === "maps.app.goo.gl") return true;

  if (url.hostname === "goo.gl") {
    return url.pathname === "/maps" || url.pathname.startsWith("/maps/");
  }

  if (url.hostname === "google.com" || url.hostname === "www.google.com") {
    return url.pathname === "/maps" || url.pathname.startsWith("/maps/");
  }

  return true;
}

export function normalizeTrustedMapUrl(value?: string | null) {
  const cleanValue = value?.trim();
  if (!cleanValue) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(cleanValue)) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(cleanValue) && !/^https?:\/\//i.test(cleanValue)) return null;

  if (/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(cleanValue)) {
    const [latText, lngText] = cleanValue.split(",").map((part) => part.trim());
    const lat = Number(latText);
    const lng = Number(lngText);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${lat},${lng}`
      )}`;
    }

    return null;
  }

  try {
    const url = toUrl(cleanValue);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

    if (!TRUSTED_MAP_HOSTS.has(hostname)) return null;
    if (url.username || url.password) return null;
    if (url.port) return null;
    // Apply the path allowlist to the same canonical host checked above.
    url.hostname = hostname;
    if (!hasSafeGooglePath(url)) return null;

    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}

export function trustedMapUrlFromText(value?: string | null) {
  if (!value) return null;

  const matches = value.match(/https?:\/\/[^\s<>"']+/gi) ?? [];

  for (const match of matches) {
    const normalized = normalizeTrustedMapUrl(match.replace(/[),.;،؛]+$/, ""));
    if (normalized) return normalized;
  }

  return null;
}
