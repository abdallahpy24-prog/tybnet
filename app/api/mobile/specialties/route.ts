import {
  NextRequest,
  NextResponse
} from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400"
};

type SpecialtyForValue =
  | "DOCTOR"
  | "COSMETIC_DOCTOR";

function readSpecialtyFor(
  value: string | null
): SpecialtyForValue[] {
  if (value === "DOCTOR") {
    return ["DOCTOR"];
  }

  if (value === "DENTIST") {
    return [];
  }

  if (value === "COSMETIC_DOCTOR") {
    return ["COSMETIC_DOCTOR"];
  }

  return [
    "DOCTOR",
    "COSMETIC_DOCTOR"
  ];
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const forTypes = readSpecialtyFor(
      searchParams.get("forType")
    );

    if (!forTypes.length) {
      return NextResponse.json(
        {
          ok: true,
          count: 0,
          items: []
        },
        {
          headers: SUCCESS_CACHE_HEADERS
        }
      );
    }

    const specialties =
      await prisma.specialty.findMany({
        where: {
          isActive: true,
          forType: {
            in: forTypes
          }
        },
        orderBy: [
          {
            name: "asc"
          }
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          forType: true
        }
      });

    return NextResponse.json(
      {
        ok: true,
        count: specialties.length,
        items: specialties
      },
      {
        headers: SUCCESS_CACHE_HEADERS
      }
    );
  } catch (error) {
    console.error(
      "Mobile specialties API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "صار خطأ أثناء جلب الاختصاصات"
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
