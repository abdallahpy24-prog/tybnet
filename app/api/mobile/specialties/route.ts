import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readSpecialtyFor(value: string | null) {
  if (value === "DOCTOR") {
    return ["DOCTOR", "BOTH"] as const;
  }

  if (value === "DENTIST") {
    return ["DENTIST", "BOTH"] as const;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forType = readSpecialtyFor(searchParams.get("forType"));

    const specialties = await prisma.specialty.findMany({
      where: {
        isActive: true,
        forType: forType
          ? {
              in: [...forType],
            }
          : undefined,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        forType: true,
      },
    });

    return NextResponse.json({
      ok: true,
      count: specialties.length,
      items: specialties,
    });
  } catch (error) {
    console.error("Mobile specialties API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب الاختصاصات",
      },
      { status: 500 }
    );
  }
}