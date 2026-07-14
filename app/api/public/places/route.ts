import { NextRequest, NextResponse } from "next/server";

import {
  getPublicCosmeticCentersPage,
  getPublicLabsPage,
  getPublicPharmaciesPage,
  type PublicPageOptions,
  type SearchParams
} from "@/lib/queries";

export const runtime = "nodejs";

type PlaceKind =
  | "pharmacy"
  | "lab"
  | "cosmetic-center";

type PharmacyPageItem = Awaited<
  ReturnType<typeof getPublicPharmaciesPage>
>["items"][number];

type LabPageItem = Awaited<
  ReturnType<typeof getPublicLabsPage>
>["items"][number];

type CosmeticCenterPageItem = Awaited<
  ReturnType<typeof getPublicCosmeticCentersPage>
>["items"][number];

type PlacePageItem =
  | PharmacyPageItem
  | LabPageItem
  | CosmeticCenterPageItem;

const DEFAULT_PAGE_SIZE = 4;
const MAX_PAGE_SIZE = 12;
const MAX_QUERY_LENGTH = 120;
const MAX_ID_LENGTH = 191;
const MAX_CURSOR_LENGTH = 512;

const ALLOWED_PLACE_KINDS = new Set<PlaceKind>([
  "pharmacy",
  "lab",
  "cosmetic-center"
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

function readPlaceKind(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("kind");

  if (
    !value ||
    !ALLOWED_PLACE_KINDS.has(value as PlaceKind)
  ) {
    return null;
  }

  return value as PlaceKind;
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

function toPublicListItem(item: PlacePageItem) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    imageUrl: item.imageUrl,
    imageThumbnailUrl: item.imageThumbnailUrl,
    whatsapp: item.whatsapp,
    instagramUrl:
      "instagramUrl" in item
        ? item.instagramUrl
        : null,
    workingHours: item.workingHours,
    address: item.address,
    inquiryCount: item.inquiryCount,
    governorate: {
      name: item.governorate.name
    },
    area: {
      name: item.area.name
    }
  };
}

async function loadPlacePage(
  kind: PlaceKind,
  params: SearchParams,
  options: PublicPageOptions
) {
  if (kind === "pharmacy") {
    const page = await getPublicPharmaciesPage(
      params,
      options
    );

    return {
      items: page.items.map(toPublicListItem),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore
    };
  }

  if (kind === "lab") {
    const page = await getPublicLabsPage(
      params,
      options
    );

    return {
      items: page.items.map(toPublicListItem),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore
    };
  }

  const page = await getPublicCosmeticCentersPage(
    params,
    options
  );

  return {
    items: page.items.map(toPublicListItem),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore
  };
}

export async function GET(request: NextRequest) {
  try {
    const kind = readPlaceKind(request);

    if (!kind) {
      return errorResponse("نوع المكان غير صحيح", 400);
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
    const cursor = readOptionalValue(
      request,
      "cursor",
      MAX_CURSOR_LENGTH
    );

    if (
      !q.ok ||
      !governorateId.ok ||
      !areaId.ok ||
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
      areaId: areaId.value
    };

    const page = await loadPlacePage(
      kind,
      params,
      {
        cursor: cursor.value,
        take
      }
    );

    return NextResponse.json(
      {
        ok: true,
        items: page.items,
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
    console.error("Public places pagination API error", error);

    return errorResponse("تعذر تحميل قائمة الأماكن", 500);
  }
}
