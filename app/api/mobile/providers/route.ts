import { NextRequest, NextResponse } from "next/server";

import { searchProviders } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type MobileProviderType = Parameters<typeof searchProviders>[0];

function readProviderType(value: string | null): MobileProviderType | null {
  if (value === "DOCTOR" || value === "DENTIST") {
    return value;
  }

  return null;
}

function clampTake(value: string | null) {
  const parsed = Number(value ?? "24");

  if (!Number.isFinite(parsed)) {
    return 24;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = readProviderType(searchParams.get("type"));

    if (!type) {
      return NextResponse.json(
        {
          ok: false,
          message: "type لازم يكون DOCTOR أو DENTIST",
        },
        { status: 400 }
      );
    }

    const providers = await searchProviders(
      type,
      {
        q: searchParams.get("q") ?? undefined,
        governorateId:
          searchParams.get("governorateId") ??
          searchParams.get("governorate") ??
          undefined,
        areaId: searchParams.get("areaId") ?? searchParams.get("area") ?? undefined,
        specialtyId:
          searchParams.get("specialtyId") ??
          searchParams.get("specialty") ??
          undefined,
      },
      clampTake(searchParams.get("take"))
    );

    return NextResponse.json({
      ok: true,
      count: providers.length,
      items: providers.map((provider: (typeof providers)[number]) => ({
        id: provider.id,
        type: provider.type,
        name: provider.name,
        titlePrefix: provider.titlePrefix,
        slug: provider.slug,

        specialtyId: provider.specialtyId,
        specialty: provider.specialty?.name ?? null,

        governorateId: provider.governorateId,
        governorate: provider.governorate.name,

        areaId: provider.areaId,
        area: provider.area.name,

        imageUrl: provider.imageUrl,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        instagramUrl: provider.instagramUrl,
        mapUrl: provider.mapurl,

        whatsappUrl: buildWhatsappUrl(
          provider.whatsapp,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${provider.titlePrefix} ${provider.name}.`
        ),

        address: provider.address,
        workingHours: provider.workingHours,
        bookingPoints: provider.bookingPoints,
        isFeatured: provider.isFeatured,
      })),
    });
  } catch (error) {
    console.error("Mobile providers API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب مقدمي الخدمة",
      },
      { status: 500 }
    );
  }
}