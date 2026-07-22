import {
  NextRequest,
  NextResponse
} from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store"
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
          headers: NO_STORE_HEADERS
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
        headers: NO_STORE_HEADERS
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
        headers: NO_STORE_HEADERS
      }
    );
  }
}