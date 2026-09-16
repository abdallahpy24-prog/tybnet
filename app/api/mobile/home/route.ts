import { NextResponse } from "next/server";

import { getHomeData, getOffers, searchProvidersPage } from "@/lib/queries";
import { normalizeTrustedMapUrl, trustedMapUrlFromText } from "@/lib/maps";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control":
    "no-store"
};

function getBaseUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (host) {
    const protocol = forwardedProto?.split(",")[0]?.trim() || "https";
    const cleanHost = host.split(",")[0]?.trim();

    return `${protocol}://${cleanHost}`;
  }

  return new URL(request.url).origin;
}

function buildTelUrl(phone?: string | null) {
  const cleanPhone = phone?.trim();

  if (!cleanPhone) return null;

  const telValue = cleanPhone.replace(/[^\d+]/g, "");

  if (!telValue) return null;

  return `tel:${telValue}`;
}

function normalizeAssetUrl(value: string | null | undefined, baseUrl: string) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  try {
    if (/^(https?:)?\/\//i.test(cleanValue)) {
      return cleanValue.startsWith("//") ? `https:${cleanValue}` : cleanValue;
    }

    if (/^(data:|blob:)/i.test(cleanValue)) {
      return cleanValue;
    }

    return new URL(
      cleanValue.startsWith("/") ? cleanValue : `/${cleanValue}`,
      baseUrl
    ).toString();
  } catch {
    return cleanValue;
  }
}


export async function GET(request: Request) {
  try {
    const baseUrl = getBaseUrl(request);
    const [home, offers, featured] = await Promise.all([
      getHomeData(), getOffers(), searchProvidersPage("DOCTOR", { featuredOnly: "true" }, { take: 6 })
    ]);

    return NextResponse.json(
      {
        ok: true,

        sections: [
          {
            key: "doctors",
            title: "أطباء",
            type: "DOCTOR",
            count: home.counts.doctors
          },
          {
            key: "dentists",
            title: "أطباء أسنان",
            type: "DENTIST",
            count: home.counts.dentists
          },
          {
            key: "pharmacies",
            title: "صيدليات",
            count: home.counts.pharmacies
          },
          {
            key: "labs",
            title: "مختبرات",
            count: home.counts.labs
          }
        ],

        featuredProviders: featured.items.map((provider) => {
          const displayName = [provider.titlePrefix, provider.name]
            .filter(Boolean)
            .join(" ");

          const mapUrl =
            normalizeTrustedMapUrl(provider.mapurl) ??
            trustedMapUrlFromText(provider.address);

          const profileImageUrl = normalizeAssetUrl(
            provider.imageUrl ?? provider.imageThumbnailUrl,
            baseUrl
          );

          const thumbnailImageUrl = normalizeAssetUrl(
            provider.imageThumbnailUrl ?? provider.imageUrl,
            baseUrl
          );

          const originalImageUrl = normalizeAssetUrl(
            provider.imageOriginalUrl ?? provider.imageUrl,
            baseUrl
          );

          return {
            id: provider.id,
            type: provider.type,
            name: provider.name,
            titlePrefix: provider.titlePrefix,
            slug: provider.slug,

            specialtyId: provider.specialtyId,
            specialty: provider.specialty?.name ?? null,

            governorateId: provider.governorateId,
            governorate: provider.governorate?.name ?? null,

            areaId: provider.areaId,
            area: provider.area?.name ?? null,

            imageThumbnailUrl: thumbnailImageUrl,
            imageUrl: profileImageUrl,
            imageOriginalUrl: originalImageUrl,

            phone: provider.phone,
            phoneUrl: buildTelUrl(provider.phone),

            whatsapp: provider.whatsapp,
            whatsappUrl: buildWhatsappUrl(
              provider.whatsapp || provider.phone,
              `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${displayName}.`
            ),

            address: provider.address,
            mapUrl,

            bookingPoints: provider.bookingPoints,
            isFeatured: provider.isFeatured
          };
        }),

        offers: offers.slice(0, 6).map((offer) => ({
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          description: offer.description,
          imageUrl: normalizeAssetUrl(offer.imageUrl, baseUrl),
          discountText: offer.discountText,
          startsAt: offer.startsAt,
          endsAt: offer.endsAt
        }))
      },
      {
        headers: SUCCESS_CACHE_HEADERS
      }
    );
  } catch (error) {
    console.error("Mobile home API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب بيانات الواجهة الرئيسية"
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

