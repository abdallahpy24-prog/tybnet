const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_TATWEEL = /\u0640/g;

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9"
};

export function normalizeArabicDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => ARABIC_DIGITS[digit] ?? digit);
}

export function normalizeArabicText(value: string) {
  return normalizeArabicDigits(value)
    .normalize("NFKC")
    .replace(ARABIC_DIACRITICS, "")
    .replace(ARABIC_TATWEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىی]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[،؛,:/\\|()[\]{}<>._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const IGNORED_SEARCH_TOKENS = new Set([
  "د",
  "دكتور",
  "دكتوره",
  "دكتورة",
  "طبيب",
  "طبيبه",
  "طبيبة"
]);

export function tokenizeSearch(value?: string | null) {
  if (!value) return [];

  const normalized = normalizeArabicText(value);

  if (!normalized) return [];

  const tokens = normalized
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !IGNORED_SEARCH_TOKENS.has(token));

  return Array.from(new Set(tokens)).slice(0, 8);
}

function expandAlefVariants(token: string, limit = 12) {
  const positions = Array.from(token)
    .map((char, index) => (char === "ا" ? index : -1))
    .filter((index) => index >= 0)
    .slice(0, 2);

  if (!positions.length) return [token];

  const variants = new Set<string>([token]);
  const alefForms = ["ا", "أ", "إ", "آ"];

  function visit(positionIndex: number, chars: string[]) {
    if (variants.size >= limit) return;

    if (positionIndex >= positions.length) {
      variants.add(chars.join(""));
      return;
    }

    const position = positions[positionIndex];

    for (const form of alefForms) {
      if (variants.size >= limit) break;
      const next = [...chars];
      next[position] = form;
      visit(positionIndex + 1, next);
    }
  }

  visit(0, Array.from(token));
  return Array.from(variants);
}

export function searchTokenVariants(token: string) {
  const normalized = normalizeArabicText(token);
  const variants = new Set<string>(expandAlefVariants(normalized));

  if (normalized.includes("ي")) {
    variants.add(normalized.replace(/ي/g, "ى"));
    variants.add(normalized.replace(/ي/g, "ی"));
  }

  if (normalized.includes("ه")) {
    variants.add(normalized.replace(/ه/g, "ة"));
  }

  if (normalized.includes("ة")) {
    variants.add(normalized.replace(/ة/g, "ه"));
  }

  return Array.from(variants).filter(Boolean).slice(0, 18);
}

export function clampPublicSearchQuery(value?: string | null, maxLength = 120) {
  const normalizedDigits = normalizeArabicDigits(value ?? "");
  const trimmed = normalizedDigits.trim();

  if (!trimmed) return undefined;

  return trimmed.slice(0, maxLength);
}
