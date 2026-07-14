import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400"
};

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawGovernorateId = searchParams.get("governorateId")?.trim();

    if (rawGovernorateId && rawGovernorateId.length > 191) {
      return errorResponse("معرف المحافظة غير صحيح", 400);
    }

    const governorateId = rawGovernorateId || undefined;

    const areas = await prisma.area.findMany({
      where: {
        isActive: true,
        governorate: {
          isActive: true
        },
        governorateId
      },
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
        headers: SUCCESS_CACHE_HEADERS
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
