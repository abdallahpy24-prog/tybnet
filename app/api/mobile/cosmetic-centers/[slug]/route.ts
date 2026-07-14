import {
  NextRequest,
  NextResponse
} from "next/server";

import {
  getPublicCosmeticCenterBySlug
} from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=300, stale-while-revalidate=3600"
};

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get(
    "x-forwarded-host"
  );

  const host =
    forwardedHost ??
    request.headers.get("host");

  const forwardedProto = request.headers.get(
    "x-forwarded-proto"
  );

  if (host) {
    const protocol =
      forwardedProto
        ?.split(",")[0]
        ?.trim() || "https";

    const cleanHost =
      host.split(",")[0]?.trim();

    return `${protocol}://${cleanHost}`;
  }

  return new URL(request.url).origin;
}

function getSiteUrl(baseUrl: string) {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    baseUrl
  ).replace(/\/$/, "");
}

function cleanText(
  value?: string | null
) {
  return String(value || "").trim();
}

function buildTelUrl(
  phone?: string | null
) {
  const cleanPhone = phone?.trim();

  if (!cleanPhone) {
    return null;
  }

  const telValue = cleanPhone.replace(
    /[^\d+]/g,
    ""
  );

  if (!telValue) {
    return null;
  }

  return `tel:${telValue}`;
}

function normalizeAssetUrl(
  value: string | null | undefined,
  baseUrl: string
) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return null;
  }

  try {
    if (
      /^(https?:)?\/\//i.test(
        cleanValue
      )
    ) {
      return cleanValue.startsWith("//")
        ? `https:${cleanValue}`
        : cleanValue;
    }

    if (
      /^(data:|blob:)/i.test(
        cleanValue
      )
    ) {
      return cleanValue;
    }

    return new URL(
      cleanValue.startsWith("/")
        ? cleanValue
        : `/${cleanValue}`,
      baseUrl
    ).toString();
  } catch {
    return cleanValue;
  }
}

function normalizeMapUrl(
  value?: string | null
) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return null;
  }

  try {
    if (
      /^https?:\/\//i.test(cleanValue)
    ) {
      return new URL(
        cleanValue
      ).toString();
    }

    if (
      cleanValue.startsWith(
        "www.google.com/maps"
      ) ||
      cleanValue.startsWith(
        "google.com/maps"
      ) ||
      cleanValue.startsWith(
        "maps.google.com"
      ) ||
      cleanValue.startsWith(
        "maps.app.goo.gl"
      ) ||
      cleanValue.startsWith(
        "goo.gl/maps"
      ) ||
      cleanValue.startsWith(
        "maps.apple.com"
      )
    ) {
      return new URL(
        `https://${cleanValue}`
      ).toString();
    }

    if (
      /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(
        cleanValue
      )
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cleanValue
      )}`;
    }

    return null;
  } catch {
    return null;
  }
}

function readMapUrlFromText(
  value?: string | null
) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return null;
  }

  const directUrl =
    normalizeMapUrl(cleanValue);

  if (directUrl) {
    return directUrl;
  }

  const match = cleanValue.match(
    /(https?:\/\/(?:www\.)?google\.com\/maps[^\s،]+|https?:\/\/maps\.google\.com[^\s،]+|https?:\/\/maps\.app\.goo\.gl[^\s،]+|https?:\/\/goo\.gl\/maps[^\s،]+|https?:\/\/maps\.apple\.com[^\s،]+)/i
  );

  if (!match?.[0]) {
    return null;
  }

  return normalizeMapUrl(match[0]);
}

function buildCosmeticCenterSummary(
  input: {
    name: string;
    bio?: string | null;
    services?: string | null;
    governorate?: string | null;
    area?: string | null;
    address?: string | null;
    workingHours?: string | null;
  }
) {
  if (input.bio?.trim()) {
    return input.bio.trim();
  }

  const location = [
    input.governorate,
    input.area
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const lines = [
    `مركز تجميل ${input.name}${
      location
        ? ` في ${location}`
        : ""
    }.`,
    input.services
      ? `الخدمات: ${input.services}`
      : null,
    input.address
      ? `العنوان: ${input.address}`
      : null,
    input.workingHours
      ? `أوقات العمل: ${input.workingHours}`
      : null,
    "يمكنك الاستفسار عن الخدمات التجميلية والأسعار والمواعيد عبر واتساب أو الاتصال السريع عند توفر بيانات التواصل."
  ].filter(Boolean);

  return lines.join("\n");
}

function buildCosmeticCenterWhatsappMessage(
  input: {
    name: string;
    governorate?: string | null;
    area?: string | null;
    address?: string | null;
    services?: string | null;
    workingHours?: string | null;
    profileUrl: string;
  }
) {
  const location = [
    input.governorate,
    input.area
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const lines = [
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن خدمة تجميلية أو موعد.",
    "",
    `مركز التجميل: ${input.name}`,
    location
      ? `المنطقة: ${location}`
      : null,
    input.services
      ? `الخدمات: ${input.services}`
      : null,
    input.address
      ? `العنوان: ${input.address}`
      : null,
    input.workingHours
      ? `أوقات العمل: ${input.workingHours}`
      : null,
    "",
    `رابط الصفحة: ${input.profileUrl}`
  ].filter(Boolean);

  return lines.join("\n");
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } =
      await context.params;

    const cleanSlug =
      decodeURIComponent(slug);

    const baseUrl = getBaseUrl(request);
    const siteUrl = getSiteUrl(baseUrl);

    const center =
      await getPublicCosmeticCenterBySlug(
        cleanSlug
      );

    if (!center) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "مركز التجميل غير موجود"
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const governorateName =
      center.governorate?.name ??
      "غير محددة";

    const areaName =
      center.area?.name ??
      "غير محددة";

    const profilePath =
      `/cosmetic-centers/${center.slug}`;

    const profileUrl =
      `${siteUrl}${profilePath}`;

    const inquiryUrl =
      `${baseUrl}/api/mobile/cosmetic-centers/${center.slug}/inquiry`;

    const mapUrl =
      normalizeMapUrl(center.mapurl) ??
      readMapUrlFromText(
        center.address
      );

    const whatsappMessage =
      buildCosmeticCenterWhatsappMessage(
        {
          name: center.name,
          governorate:
            governorateName,
          area: areaName,
          address: center.address,
          services:
            center.services,
          workingHours:
            center.workingHours,
          profileUrl
        }
      );

    const profileImageUrl =
      normalizeAssetUrl(
        center.imageUrl ??
          center.imageThumbnailUrl,
        baseUrl
      );

    const thumbnailImageUrl =
      normalizeAssetUrl(
        center.imageThumbnailUrl ??
          center.imageUrl,
        baseUrl
      );

    const originalImageUrl =
      normalizeAssetUrl(
        center.imageOriginalUrl ??
          center.imageUrl,
        baseUrl
      );

    return NextResponse.json(
      {
        ok: true,
        item: {
          id: center.id,
          type: "cosmetic-center",
          kindLabel: "مركز تجميل",

          name: center.name,
          slug: center.slug,

          governorateId:
            center.governorateId,
          governorate:
            governorateName,

          areaId: center.areaId,
          area: areaName,

          bio: center.bio,
          services: center.services,

          summary:
            buildCosmeticCenterSummary({
              name: center.name,
              bio: center.bio,
              services:
                center.services,
              governorate:
                governorateName,
              area: areaName,
              address:
                center.address,
              workingHours:
                center.workingHours
            }),

          imageThumbnailUrl:
            thumbnailImageUrl,
          imageUrl: profileImageUrl,
          imageOriginalUrl:
            originalImageUrl,

          phone: center.phone,
          phoneUrl: buildTelUrl(
            center.phone
          ),

          whatsapp:
            center.whatsapp,

          whatsappUrl:
            buildWhatsappUrl(
              center.whatsapp,
              whatsappMessage
            ),

          instagramUrl:
            center.instagramUrl,

          address: center.address,
          mapUrl,

          workingHours:
            center.workingHours,

          isFeatured:
            center.isFeatured,

          inquiryCount:
            center.inquiryCount,

          profileUrl,
          detailsUrl: profileUrl,
          shareUrl: profileUrl,
          inquiryUrl,

          primaryActionLabel:
            "استفسار",

          detailsActionLabel:
            "التفاصيل",

          secondaryActionLabel:
            "اتصال سريع",

          mapActionLabel: "الموقع"
        }
      },
      {
        headers: SUCCESS_CACHE_HEADERS
      }
    );
  } catch (error) {
    console.error(
      "Mobile cosmetic center details API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "صار خطأ أثناء جلب بيانات مركز التجميل"
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
