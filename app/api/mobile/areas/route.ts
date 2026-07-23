import { Prisma } from "@prisma/client";
import {
  NextRequest,
  NextResponse
} from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FilterableProviderType =
  | "DOCTOR"
  | "COSMETIC_DOCTOR";

type FilterablePlaceType =
  | "pharmacies"
  | "labs"
  | "cosmetic-centers";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      message
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function readProviderType(
  value: string | null
): FilterableProviderType | null {
  if (
    value === "DOCTOR" ||
    value === "COSMETIC_DOCTOR"
  ) {
    return value;
  }

  return null;
}

function readPlaceType(
  value: string | null
): FilterablePlaceType | null {
  if (
    value === "pharmacies" ||
    value === "labs" ||
    value === "cosmetic-centers"
  ) {
    return value;
  }

  return null;
}

function readId(
  searchParams: URLSearchParams,
  key: string
) {
  const value = searchParams.get(key)?.trim();

  if (!value) {
    return {
      ok: true as const,
      value: undefined
    };
  }

  if (value.length > 191) {
    return {
      ok: false as const,
      value: undefined
    };
  }

  return {
    ok: true as const,
    value
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const governorateIdResult = readId(
      searchParams,
      "governorateId"
    );

    if (!governorateIdResult.ok) {
      return errorResponse(
        "معرف المحافظة غير صحيح",
        400
      );
    }

    const specialtyIdResult = readId(
      searchParams,
      "specialtyId"
    );

    if (!specialtyIdResult.ok) {
      return errorResponse(
        "معرف الاختصاص غير صحيح",
        400
      );
    }

    const rawForType = searchParams
      .get("forType")
      ?.trim();

    const forType = readProviderType(
      rawForType ?? null
    );

    if (rawForType && !forType) {
      return errorResponse(
        "نوع مقدم الخدمة غير صحيح",
        400
      );
    }

    const rawPlaceType = searchParams
      .get("placeType")
      ?.trim();

    const placeType = readPlaceType(
      rawPlaceType ?? null
    );

    if (rawPlaceType && !placeType) {
      return errorResponse(
        "نوع القسم غير صحيح",
        400
      );
    }

    const governorateId =
      governorateIdResult.value;
    const specialtyId =
      specialtyIdResult.value;

    if (
      Boolean(specialtyId) !==
      Boolean(forType)
    ) {
      return errorResponse(
        "يجب إرسال الاختصاص ونوع مقدم الخدمة معاً",
        400
      );
    }

    if (
      placeType &&
      (specialtyId || forType)
    ) {
      return errorResponse(
        "لا يمكن دمج فلتر القسم مع فلتر الاختصاص",
        400
      );
    }

    if (placeType && !governorateId) {
      return errorResponse(
        "يجب اختيار المحافظة أولاً",
        400
      );
    }

    const placeWhere: Prisma.AreaWhereInput =
      placeType === "pharmacies"
        ? {
            pharmacies: {
              some: {
                status: "ACTIVE"
              }
            }
          }
        : placeType === "labs"
          ? {
              labs: {
                some: {
                  status: "ACTIVE"
                }
              }
            }
          : placeType ===
              "cosmetic-centers"
            ? {
                cosmeticCenters: {
                  some: {
                    status: "ACTIVE"
                  }
                }
              }
            : {};

    const where: Prisma.AreaWhereInput = {
      isActive: true,
      governorate: {
        isActive: true
      },
      governorateId,
      ...placeWhere,
      providers:
        specialtyId && forType
          ? {
              some: {
                status: "ACTIVE",
                type: forType,
                governorateId,
                specialtyId,
                specialty: {
                  isActive: true,
                  forType
                }
              }
            }
          : undefined
    };

    const areas = await prisma.area.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        governorateId: true
      }
    });

    return NextResponse.json(
      {
        ok: true,
        count: areas.length,
        items: areas
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Mobile areas API error", error);

    return errorResponse(
      "صار خطأ أثناء جلب المناطق",
      500
    );
  }
}
