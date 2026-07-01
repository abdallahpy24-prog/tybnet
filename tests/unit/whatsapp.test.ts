import { describe, expect, it } from "vitest";
import { buildWhatsappUrl, normalizeIraqWhatsapp } from "@/lib/whatsapp";

describe("normalizeIraqWhatsapp", () => {
  it("normalizes local Iraqi mobile numbers", () => {
    expect(normalizeIraqWhatsapp("0770 123 4567")).toBe("9647701234567");
  });

  it("keeps international Iraqi numbers", () => {
    expect(normalizeIraqWhatsapp("+964 771 222 3333")).toBe("9647712223333");
  });

  it("rejects non Iraqi mobile numbers", () => {
    expect(normalizeIraqWhatsapp("12345")).toBeNull();
  });
});

describe("buildWhatsappUrl", () => {
  it("builds wa.me URLs", () => {
    expect(buildWhatsappUrl("07701234567")).toContain("https://wa.me/9647701234567");
  });
});
