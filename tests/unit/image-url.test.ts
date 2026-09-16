import { describe, expect, it } from "vitest";
import { normalizeDisplayImageUrl } from "@/lib/image-url";

describe("supported display images", () => {
  it.each(["/assets/logo.png", "https://project.supabase.co/storage/v1/object/public/images/test.png", "https://test.public.blob.vercel-storage.com/test.png"])("accepts a configured source: %s", (url) => {
    expect(normalizeDisplayImageUrl(url)).toBe(url);
  });
  it.each(["//evil.example/image.png", "/\\evil.example/test", "javascript:alert(1)", "https://evil.example/image.png", "https://project.supabase.co/private/image.png", "https://user:password@project.supabase.co/storage/v1/object/public/a.png"])("rejects unsupported sources: %s", (url) => {
    expect(normalizeDisplayImageUrl(url)).toBeNull();
  });
});
