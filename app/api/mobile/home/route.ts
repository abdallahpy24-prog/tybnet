import { NextResponse } from "next/server";

import { getHomeData, getOffers } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [home, offers] = await Promise.all([getHomeData(), getOffers()]);

    return NextResponse.json({
      ok: true,

      sections: [
        {
          key: "doctors",
          title: "أطباء",
          type: "DOCTOR",
          count: home.counts.doctors,
        },
        {
          key: "dentists",
          title: "أطباء أسنان",
          type: "DENTIST",
          count: home.counts.dentists,
        },
        {
          key: "pharmacies",
          title: "صيدليات",
          count: home.counts.pharmacies,
        },
        {
          key: "labs",
          title: "مختبرات",
          count: home.counts.labs,
        },
      ],

      featuredProviders: home.featured.map((provider) => ({
        id: provider.id,
        type: provider.type,
        name: provider.name,
        titlePrefix: provider.titlePrefix,
        slug: provider.slug,
        specialty: provider.specialty?.name ?? null,
        governorate: provider.governorate.name,
        area: provider.area.name,
        imageUrl: provider.imageUrl,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        whatsappUrl: buildWhatsappUrl(
          provider.whatsapp || provider.phone,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${provider.titlePrefix} ${provider.name}.`
        ),
        bookingPoints: provider.bookingPoints,
        isFeatured: provider.isFeatured,
      })),

      offers: offers.slice(0, 6).map((offer) => ({
        id: offer.id,
        title: offer.title,
        slug: offer.slug,
        description: offer.description,
        imageUrl: offer.imageUrl,
        discountText: offer.discountText,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
      })),
    });
  } catch (error) {
    console.error("Mobile home API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب بيانات الواجهة الرئيسية",
      },
      { status: 500 }
    );
  }
}