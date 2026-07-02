import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const governorateId = searchParams.get("governorateId") ?? undefined;

    const areas = await prisma.area.findMany({
      where: {
        isActive: true,
        governorate: {
          isActive: true,
        },
        governorateId,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        governorateId: true,
      },
    });

    return NextResponse.json({
      ok: true,
      count: areas.length,
      items: areas,
    });
  } catch (error) {
    console.error("Mobile areas API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب المناطق",
      },
      { status: 500 }
    );
  }
}