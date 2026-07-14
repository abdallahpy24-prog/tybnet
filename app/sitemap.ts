import type { Prisma } from "@prisma/client";
import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

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

function pageUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path}`;
}

function publicPlaceWhere() {
  return {
    status: "ACTIVE" as const,
    governorate: {
      isActive: true
    },
    area: {
      isActive: true
    }
  };
}

function publicProviderWhere(): Prisma.ProviderWhereInput {
  return {
    ...publicPlaceWhere(),
    OR: [
      {
        type: "DOCTOR",
        specialty: {
          is: {
            isActive: true,
            forType: "DOCTOR"
          }
        }
      },
      {
        type: "DENTIST"
      },
      {
        type: "COSMETIC_DOCTOR",
        specialty: {
          is: {
            isActive: true,
            forType: "COSMETIC_DOCTOR"
          }
        }
      }
    ]
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const generatedAt = new Date();

  const staticPageDefinitions: Array<{
    path: string;
    priority: number;
    changeFrequency: NonNullable<
      MetadataRoute.Sitemap[number]["changeFrequency"]
    >;
  }> = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/doctors", priority: 0.9, changeFrequency: "daily" },
    { path: "/dentists", priority: 0.9, changeFrequency: "daily" },
    { path: "/cosmetic-doctors", priority: 0.9, changeFrequency: "daily" },
    { path: "/pharmacies", priority: 0.9, changeFrequency: "daily" },
    { path: "/labs", priority: 0.9, changeFrequency: "daily" },
    { path: "/cosmetic-centers", priority: 0.9, changeFrequency: "daily" },
    { path: "/offers", priority: 0.8, changeFrequency: "daily" },
    { path: "/leaders", priority: 0.7, changeFrequency: "daily" },
    { path: "/join", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    {
      path: "/medical-disclaimer",
      priority: 0.3,
      changeFrequency: "yearly"
    }
  ];

  const staticPages: MetadataRoute.Sitemap = staticPageDefinitions.map(
    ({ path, ...entry }) => ({
      ...entry,
      url: pageUrl(baseUrl, path),
      lastModified: generatedAt
    })
  );

  try {
    const [providers, pharmacies, labs, cosmeticCenters] = await Promise.all([
      prisma.provider.findMany({
        where: publicProviderWhere(),
        select: {
          slug: true,
          type: true,
          updatedAt: true
        }
      }),
      prisma.pharmacy.findMany({
        where: publicPlaceWhere(),
        select: {
          slug: true,
          updatedAt: true
        }
      }),
      prisma.lab.findMany({
        where: publicPlaceWhere(),
        select: {
          slug: true,
          updatedAt: true
        }
      }),
      prisma.cosmeticCenter.findMany({
        where: publicPlaceWhere(),
        select: {
          slug: true,
          updatedAt: true
        }
      })
    ]);

    const providerPages: MetadataRoute.Sitemap = providers.map((provider) => ({
      url: pageUrl(
        baseUrl,
        provider.type === "COSMETIC_DOCTOR"
          ? `/cosmetic-doctors/${provider.slug}`
          : `/providers/${provider.slug}`
      ),
      lastModified: provider.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8
    }));

    const pharmacyPages: MetadataRoute.Sitemap = pharmacies.map((pharmacy) => ({
      url: pageUrl(baseUrl, `/pharmacies/${pharmacy.slug}`),
      lastModified: pharmacy.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7
    }));

    const labPages: MetadataRoute.Sitemap = labs.map((lab) => ({
      url: pageUrl(baseUrl, `/labs/${lab.slug}`),
      lastModified: lab.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7
    }));

    const cosmeticCenterPages: MetadataRoute.Sitemap = cosmeticCenters.map(
      (center) => ({
        url: pageUrl(baseUrl, `/cosmetic-centers/${center.slug}`),
        lastModified: center.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7
      })
    );

    return [
      ...staticPages,
      ...providerPages,
      ...pharmacyPages,
      ...labPages,
      ...cosmeticCenterPages
    ];
  } catch (error) {
    console.error("Sitemap database error", error);
    return staticPages;
  }
}
