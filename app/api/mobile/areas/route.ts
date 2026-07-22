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

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      ok: false,
      message
    },
    {
      status,
      headers: NO_STORE_HEADERS
    }
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const rawGovernorateId =
      searchParams
        .get("governorateId")
        ?.trim();

    if (
      rawGovernorateId &&
      rawGovernorateId.length > 191
    ) {
      return errorResponse(
        "معرف المحافظة غير صحيح",
        400
      );
    }

    const governorateId =
      rawGovernorateId || undefined;

    const areas =
      await prisma.area.findMany({
        where: {
          isActive: true,
          governorate: {
            isActive: true
          },
          governorateId
        },
        orderBy: [
          {
            sortOrder: "asc"
          },
          {
            name: "asc"
          }
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
        headers: NO_STORE_HEADERS
      }
    );
  } catch (error) {
    console.error(
      "Mobile areas API error",
      error
    );

    return errorResponse(
      "صار خطأ أثناء جلب المناطق",
      500
    );
  }
}