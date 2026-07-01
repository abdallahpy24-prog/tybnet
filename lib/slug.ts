const arabicMap: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "th",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ى: "a",
  ة: "h",
  ئ: "e",
  ؤ: "o",
  ء: "a"
};

export function slugify(input: string) {
  const transliterated = input
    .trim()
    .split("")
    .map((char) => arabicMap[char] ?? char)
    .join("");

  const slug = transliterated
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

export function uniqueSlug(base: string, suffix?: number) {
  const slug = slugify(base);

  return suffix ? `${slug}-${suffix}` : slug;
}