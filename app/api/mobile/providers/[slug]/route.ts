import { NextResponse } from "next/server";

import { getProviderBySlug } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function buildTelUrl(phone?: string | null) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s/g, "")}`;
}

function normalizeMapUrl(value?: string | null) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  try {
    if (/^https?:\/\//i.test(cleanValue)) {
      return new URL(cleanValue).toString();
    }

    if (
      cleanValue.startsWith("www.") ||
      cleanValue.startsWith("maps.") ||
      cleanValue.startsWith("goo.gl") ||
      cleanValue.startsWith("maps.app.goo.gl")
    ) {
      return new URL(`https://${cleanValue}`).toString();
    }

    return cleanValue;
  } catch {
    return cleanValue;
  }
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const provider = await getProviderBySlug(slug);

    if (!provider) {
      return NextResponse.json(
        {
          ok: false,
          message: "مقدم الخدمة غير موجود",
        },
        { status: 404 }
      );
    }

    const whatsappNumber = provider.whatsapp || provider.phone;

    return NextResponse.json({
      ok: true,
      item: {
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

        bio: provider.bio,
        imageUrl: provider.imageUrl,

        phone: provider.phone,
        phoneUrl: buildTelUrl(provider.phone),

        whatsapp: provider.whatsapp,
        instagramUrl: provider.instagramUrl,

        whatsappUrl: buildWhatsappUrl(
          whatsappNumber,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${provider.titlePrefix} ${provider.name}.`
        ),

        address: provider.address,
        mapUrl: normalizeMapUrl(provider.mapurl) ?? readMapUrl(provider.address),

        workingHours: provider.workingHours,
        bookingPoints: provider.bookingPoints,
        isFeatured: provider.isFeatured,

        offers: provider.offers.map((offer) => ({
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          description: offer.description,
          imageUrl: offer.imageUrl,
          discountText: offer.discountText,
          startsAt: offer.startsAt,
          endsAt: offer.endsAt,
        })),
      },
    });
  } catch (error) {
    console.error("Mobile provider details API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب تفاصيل مقدم الخدمة",
      },
      { status: 500 }
    );
  }
}