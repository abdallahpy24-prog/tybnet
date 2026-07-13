import type { MetadataRoute } from "next";

function getSiteUrl() {
  const value =
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://tybnet.com";

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid-protocol");
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return "https://tybnet.com";
  }
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login"]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
