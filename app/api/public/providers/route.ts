import type { ProviderType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import {
  searchProvidersPage,
  type SearchParams
} from "@/lib/queries";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 4;
const MAX_PAGE_SIZE = 12;
const MAX_QUERY_LENGTH = 120;
const MAX_ID_LENGTH = 191;
const MAX_CURSOR_LENGTH = 512;

const ALLOWED_PROVIDER_TYPES = new Set<ProviderType>([
  "DOCTOR",
  "DENTIST",
  "COSMETIC_DOCTOR"
]);

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function readProviderType(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("type");

  if (
    !value ||
    !ALLOWED_PROVIDER_TYPES.has(value as ProviderType)
  ) {
    return null;
  }

  return value as ProviderType;
}

function readPageSize(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("take");

  if (!value) {
    return DEFAULT_PAGE_SIZE;
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    parsed > MAX_PAGE_SIZE
  ) {
    return null;
  }

  return parsed;
}

function readOptionalValue(
  request: NextRequest,
  name: string,
  maxLength: number
) {
  const value =
    request.nextUrl.searchParams.get(name)?.trim() || "";

  if (value.length > maxLength) {
    return {
      ok: false as const,
      value: undefined
    };
  }

  return {
    ok: true as const,
    value: value || undefined
  };
}

function toPublicListItem(
  provider: Awaited<
    ReturnType<typeof searchProvidersPage>
  >["items"][number]
) {
  return {
    id: provider.id,
    name: provider.name,
    titlePrefix: provider.titlePrefix,
    slug: provider.slug,
    imageUrl: provider.imageUrl,
    imageThumbnailUrl: provider.imageThumbnailUrl,
    whatsapp: provider.whatsapp,
    instagramUrl: provider.instagramUrl,
    specialty: provider.specialty
      ? {
          name: provider.specialty.name
        }
      : null,
    governorate: {
      name: provider.governorate.name
    },
    area: {
      name: provider.area.name
    },
    isFeatured: provider.isFeatured,
    bookingPoints: provider.bookingPoints
  };
}

export async function GET(request: NextRequest) {
  try {
    const type = readProviderType(request);

    if (!type) {
      return errorResponse("نوع مقدم الخدمة غير صحيح", 400);
    }

    const take = readPageSize(request);

    if (take === null) {
      return errorResponse("حجم الدفعة غير صحيح", 400);
    }

    const q = readOptionalValue(
      request,
      "q",
      MAX_QUERY_LENGTH
    );
    const governorateId = readOptionalValue(
      request,
      "governorateId",
      MAX_ID_LENGTH
    );
    const areaId = readOptionalValue(
      request,
      "areaId",
      MAX_ID_LENGTH
    );
    const specialtyId = readOptionalValue(
      request,
      "specialtyId",
      MAX_ID_LENGTH
    );
    const cursor = readOptionalValue(
      request,
      "cursor",
      MAX_CURSOR_LENGTH
    );

    if (
      !q.ok ||
      !governorateId.ok ||
      !areaId.ok ||
      !specialtyId.ok ||
      !cursor.ok
    ) {
      return errorResponse("معاملات الطلب طويلة جداً", 400);
    }

    if (
      cursor.value &&
      !/^[A-Za-z0-9_-]+$/.test(cursor.value)
    ) {
      return errorResponse("مؤشر الصفحة غير صحيح", 400);
    }

    const params: SearchParams = {
      q: q.value,
      governorateId: governorateId.value,
      areaId: areaId.value,
      specialtyId: specialtyId.value
    };

    const page = await searchProvidersPage(
      type,
      params,
      {
        cursor: cursor.value,
        take
      }
    );

    return NextResponse.json(
      {
        ok: true,
        items: page.items.map(toPublicListItem),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error("Public providers pagination API error", error);

    return errorResponse("تعذر تحميل قائمة الأطباء", 500);
  }
}
