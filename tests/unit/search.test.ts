import { describe, expect, it } from "vitest";

import {
  clampPublicSearchQuery,
  normalizeArabicDigits,
  normalizeArabicText,
  tokenizeSearch
} from "@/lib/search";

describe("Arabic search normalization", () => {
  it("normalizes Arabic and Persian digits", () => {
    expect(normalizeArabicDigits("٠٧٧۰۱۲۳٤٥٦٧")).toBe("07701234567");
  });

  it("normalizes hamza forms, tatweel and diacritics", () => {
    expect(normalizeArabicText("أَحــمَد")).toBe("احمد");
    expect(normalizeArabicText("إســكان")).toBe("اسكان");
  });

  it("keeps multi-word intent as independent tokens", () => {
    expect(tokenizeSearch("عيون النجف")).toEqual(["عيون", "النجف"]);
  });

  it("keeps Arabic place-name spelling usable after normalization", () => {
    expect(normalizeArabicText("مدينة الصدر")).toBe("مدينة الصدر");
  });

  it("drops generic doctor titles without changing the real name", () => {
    expect(tokenizeSearch("د. أحمد الخفاجي")).toEqual(["احمد", "الخفاجي"]);
  });

  it("clamps public free-text search length", () => {
    expect(clampPublicSearchQuery(" س ".repeat(200), 20)?.length).toBeLessThanOrEqual(20);
  });
});
