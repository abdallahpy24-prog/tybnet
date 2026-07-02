import { NextRequest, NextResponse } from "next/server";

import { getPublicPharmacies } from "@/lib/queries";
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

    const pharmacies = await getPublicPharmacies({
      q: searchParams.get("q") ?? undefined,
      governorateId:
        searchParams.get("governorateId") ??
        searchParams.get("governorate") ??
        undefined,
      areaId: searchParams.get("areaId") ?? searchParams.get("area") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      count: pharmacies.length,
      items: pharmacies.map((pharmacy: (typeof pharmacies)[number]) => ({
        id: pharmacy.id,
        name: pharmacy.name,
        slug: pharmacy.slug,

        governorateId: pharmacy.governorateId,
        governorate: pharmacy.governorate.name,

        areaId: pharmacy.areaId,
        area: pharmacy.area.name,

        imageUrl: pharmacy.imageUrl,
        phone: pharmacy.phone,
        phoneUrl: buildTelUrl(pharmacy.phone),

        whatsapp: pharmacy.whatsapp,
        whatsappUrl: buildWhatsappUrl(
          pharmacy.whatsapp,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${pharmacy.name}.`
        ),

        address: pharmacy.address,
        mapUrl: readMapUrl(pharmacy.address),

        workingHours: pharmacy.workingHours,
        isFeatured: pharmacy.isFeatured,
      })),
    });
  } catch (error) {
    console.error("Mobile pharmacies API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب الصيدليات",
      },
      { status: 500 }
    );
  }
}