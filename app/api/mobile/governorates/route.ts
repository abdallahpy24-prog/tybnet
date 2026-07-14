import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400"
};

export async function GET() {
  try {
    const governorates = await prisma.governorate.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    return NextResponse.json(
      {
        ok: true,
        count: governorates.length,
        items: governorates
      },
      {
        headers: SUCCESS_CACHE_HEADERS
      }
    );
  } catch (error) {
    console.error("Mobile governorates API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب المحافظات"
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
