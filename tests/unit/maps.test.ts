import { describe, expect, it } from "vitest";

import { normalizeTrustedMapUrl, trustedMapUrlFromText } from "@/lib/maps";

describe("trusted map URLs", () => {
  it("accepts Google Maps short links", () => {
    expect(normalizeTrustedMapUrl("https://maps.app.goo.gl/abc123")).toContain(
      "https://maps.app.goo.gl/"
    );
    expect(normalizeTrustedMapUrl("https://goo.gl/maps/abc123")).toContain(
      "https://goo.gl/maps/"
    );
  });

  it("converts valid coordinates to a Google Maps search URL", () => {
    expect(normalizeTrustedMapUrl("33.3152, 44.3661")).toContain(
      "google.com/maps/search"
    );
  });

  it("rejects lookalike domains", () => {
    expect(normalizeTrustedMapUrl("https://google.evil.example/maps/abc")).toBeNull();
    expect(normalizeTrustedMapUrl("https://evil.example/google/maps")).toBeNull();
    expect(normalizeTrustedMapUrl("https://www.google.com/not-maps/abc")).toBeNull();
    expect(normalizeTrustedMapUrl("https://goo.gl/not-maps/abc")).toBeNull();
  });

  it("rejects embedded credentials", () => {
    expect(normalizeTrustedMapUrl("https://user:pass@www.google.com/maps")).toBeNull();
  });

  it("cannot bypass the Google path allowlist with a trailing dot", () => {
    expect(normalizeTrustedMapUrl("https://www.google.com./url?q=https://example.org")).toBeNull();
    expect(normalizeTrustedMapUrl("https://goo.gl./outside-maps")).toBeNull();
    expect(normalizeTrustedMapUrl("https://www.google.com./maps/place/Test"))
      .toBe("https://www.google.com/maps/place/Test");
  });

  it("rejects unexpected ports, schemes, control characters and invalid coordinates", () => {
    for (const value of ["https://maps.google.com:8443/maps", "ftp://maps.google.com/maps", "https://www.goo\ngle.com/maps", "91,44", "33,181"]) {
      expect(normalizeTrustedMapUrl(value)).toBeNull();
    }
  });

  it("extracts the first trusted map URL from text", () => {
    expect(
      trustedMapUrlFromText("الموقع: https://www.google.com/maps/place/Test ثم النص")
    ).toContain("https://www.google.com/maps/place/Test");
    expect(
      trustedMapUrlFromText("الموقع: https://maps.app.goo.gl/abc123، ثم النص")
    ).toContain("https://maps.app.goo.gl/abc123");
  });
});
