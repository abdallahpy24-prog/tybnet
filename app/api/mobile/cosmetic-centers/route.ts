import {
  NextRequest,
  NextResponse
} from "next/server";

import {
  getPublicCosmeticCentersPage
} from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TAKE = 5;
const MAX_TAKE = 12;
const MAX_CURSOR_LENGTH = 512;

function clampTake(value: string | null) {
  const parsed = Number(value ?? String(DEFAULT_TAKE));

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TAKE;
  }

  return Math.min(
    Math.max(Math.trunc(parsed), 1),
    MAX_TAKE
  );
}

function readCursor(value: string | null) {
  const cursor = value?.trim();

  if (!cursor) {
    return {
      ok: true as const,
      value: null
    };
  }

  if (
    cursor.length > MAX_CURSOR_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(cursor)
  ) {
    return {
      ok: false as const,
      value: null
    };
  }

  return {
    ok: true as const,
    value: cursor
  };
}

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

function buildCosmeticCenterWhatsappMessage(
  input: {
    name: string;
    governorate?: string | null;
    area?: string | null;
    address?: string | null;
    workingHours?: string | null;
    services?: string | null;
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
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const baseUrl = getBaseUrl(request);
    const siteUrl = getSiteUrl(baseUrl);
    const cursor = readCursor(
      searchParams.get("cursor")
    );

    if (!cursor.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "مؤشر الصفحة غير صحيح"
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const page =
      await getPublicCosmeticCentersPage(
        {
          q:
            searchParams.get("q") ??
            undefined,

          governorateId:
            searchParams.get(
              "governorateId"
            ) ??
            searchParams.get(
              "governorate"
            ) ??
            undefined,

          areaId:
            searchParams.get(
              "areaId"
            ) ??
            searchParams.get("area") ??
            undefined,

          featuredOnly:
            searchParams.get(
              "featuredOnly"
            ) ??
            undefined
        },
        {
          cursor: cursor.value,
          take: clampTake(
            searchParams.get("take")
          )
        }
      );

    return NextResponse.json(
      {
        ok: true,
        count: page.items.length,
        hasMore: page.hasMore,
        nextCursor: page.nextCursor,
        items: page.items.map(
          (
            center: (typeof page.items)[number]
          ) => {
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
              normalizeMapUrl(
                center.mapurl
              ) ??
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
                  address:
                    center.address,
                  workingHours:
                    center.workingHours,
                  services:
                    center.services,
                  profileUrl
                }
              );

            const profileImageUrl =
              normalizeAssetUrl(
                center.imageUrl,
                baseUrl
              );

            return {
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
              services:
                center.services,

              imageUrl:
                profileImageUrl,
              imageThumbnailUrl:
                normalizeAssetUrl(
                  center.imageThumbnailUrl,
                  baseUrl
                ) ?? profileImageUrl,
              imageOriginalUrl:
                normalizeAssetUrl(
                  center.imageOriginalUrl,
                  baseUrl
                ) ?? profileImageUrl,

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

              address:
                center.address,
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
                "اتصال",

              mapActionLabel: "الموقع"
            };
          }
        )
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error(
      "Mobile cosmetic centers API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "صار خطأ أثناء جلب مراكز التجميل"
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
