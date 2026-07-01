import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
  const providers = await prisma.provider.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } });
  return [
    "",
    "/doctors",
    "/dentists",
    "/pharmacies",
    "/labs",
    "/offers"
  ].map((path) => ({ url: base + path, lastModified: new Date() })).concat(
    providers.map((provider) => ({ url: base + "/providers/" + provider.slug, lastModified: provider.updatedAt }))
  );
}
