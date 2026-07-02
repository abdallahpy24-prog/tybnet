import { NextResponse } from "next/server";

import { getOffers } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const offers = await getOffers();

    return NextResponse.json({
      ok: true,
      count: offers.length,
      items: offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        slug: offer.slug,
        description: offer.description,
        imageUrl: offer.imageUrl,
        discountText: offer.discountText,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,

        provider: offer.provider
          ? {
              id: offer.provider.id,
              type: offer.provider.type,
              name: offer.provider.name,
              titlePrefix: offer.provider.titlePrefix,
              slug: offer.provider.slug,
              specialty: offer.provider.specialty?.name ?? null,
              governorate: offer.provider.governorate.name,
              area: offer.provider.area.name,
              imageUrl: offer.provider.imageUrl,
              phone: offer.provider.phone,
              whatsapp: offer.provider.whatsapp,
              whatsappUrl: buildWhatsappUrl(
                offer.provider.whatsapp || offer.provider.phone,
                `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار عن عرض ${offer.title}.`
              ),
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Mobile offers API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب العروض",
      },
      { status: 500 }
    );
  }
}