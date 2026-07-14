import {
  NextRequest,
  NextResponse
} from "next/server";

import { searchProvidersPage } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MobileProviderType =
  Parameters<typeof searchProvidersPage>[0];

const DEFAULT_TAKE = 5;
const MAX_TAKE = 12;
const MAX_CURSOR_LENGTH = 512;

function readProviderType(
  value: string | null
): MobileProviderType | null {
  if (
    value === "DOCTOR" ||
    value === "DENTIST" ||
    value === "COSMETIC_DOCTOR"
  ) {
    return value;
  }

  return null;
}

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

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const baseUrl = getBaseUrl(request);

    const type = readProviderType(
      searchParams.get("type")
    );

    if (!type) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "type لازم يكون DOCTOR أو DENTIST أو COSMETIC_DOCTOR"
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

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

    const page = await searchProvidersPage(
      type,
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

        specialtyId:
          type === "DENTIST"
            ? undefined
            : searchParams.get(
                  "specialtyId"
                ) ??
                searchParams.get(
                  "specialty"
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
            provider: (typeof page.items)[number]
          ) => {
            const displayName = [
              provider.titlePrefix,
              provider.name
            ]
              .filter(Boolean)
              .join(" ");

            const mapUrl =
              normalizeMapUrl(
                provider.mapurl
              ) ??
              readMapUrlFromText(
                provider.address
              );

            const hasSpecialty =
              provider.type !== "DENTIST";

            const profileImageUrl =
              normalizeAssetUrl(
                provider.imageUrl,
                baseUrl
              );

            return {
              id: provider.id,
              type: provider.type,
              name: provider.name,
              titlePrefix:
                provider.titlePrefix,
              slug: provider.slug,

              specialtyId: hasSpecialty
                ? provider.specialtyId
                : null,
              specialty: hasSpecialty
                ? provider.specialty
                    ?.name ?? null
                : null,

              governorateId:
                provider.governorateId,
              governorate:
                provider.governorate
                  ?.name ?? null,

              areaId: provider.areaId,
              area:
                provider.area?.name ??
                null,

              imageUrl: profileImageUrl,
              imageThumbnailUrl:
                normalizeAssetUrl(
                  provider.imageThumbnailUrl,
                  baseUrl
                ) ?? profileImageUrl,
              imageOriginalUrl:
                normalizeAssetUrl(
                  provider.imageOriginalUrl,
                  baseUrl
                ) ?? profileImageUrl,

              phone: provider.phone,
              phoneUrl: buildTelUrl(
                provider.phone
              ),

              whatsapp:
                provider.whatsapp,

              instagramUrl:
                provider.instagramUrl,

              whatsappUrl:
                buildWhatsappUrl(
                  provider.whatsapp ||
                    provider.phone,
                  `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${displayName}.`
                ),

              address:
                provider.address,
              mapUrl,

              workingHours:
                provider.workingHours,
              bookingPoints:
                provider.bookingPoints,
              isFeatured:
                provider.isFeatured
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
      "Mobile providers API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "صار خطأ أثناء جلب مقدمي الخدمة"
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
