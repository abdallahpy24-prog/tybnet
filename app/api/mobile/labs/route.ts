import { NextRequest, NextResponse } from "next/server";

import { getPublicLabs } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function buildTelUrl(phone?: string | null) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s/g, "")}`;
}

function readMapUrl(address?: string | null) {
  if (!address) return null;

  const trimmed = address.trim();

  if (
    trimmed.startsWith("https://maps.app.goo.gl/") ||
    trimmed.startsWith("https://www.google.com/maps/") ||
    trimmed.startsWith("https://maps.google.com/") ||
    trimmed.startsWith("https://maps.apple.com/")
  ) {
    return trimmed;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const labs = await getPublicLabs({
      q: searchParams.get("q") ?? undefined,
      governorateId:
        searchParams.get("governorateId") ??
        searchParams.get("governorate") ??
        undefined,
      areaId: searchParams.get("areaId") ?? searchParams.get("area") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      count: labs.length,
      items: labs.map((lab: (typeof labs)[number]) => ({
        id: lab.id,
        name: lab.name,
        slug: lab.slug,

        governorateId: lab.governorateId,
        governorate: lab.governorate.name,

        areaId: lab.areaId,
        area: lab.area.name,

        services: lab.services,
        imageUrl: lab.imageUrl,
        phone: lab.phone,
        phoneUrl: buildTelUrl(lab.phone),

        whatsapp: lab.whatsapp,
        whatsappUrl: buildWhatsappUrl(
          lab.whatsapp,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${lab.name}.`
        ),

        address: lab.address,
        mapUrl: readMapUrl(lab.address),

        workingHours: lab.workingHours,
        isFeatured: lab.isFeatured,
      })),
    });
  } catch (error) {
    console.error("Mobile labs API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب المختبرات",
      },
      { status: 500 }
    );
  }
}