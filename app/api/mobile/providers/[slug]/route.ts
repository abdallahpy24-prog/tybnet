import { NextResponse } from "next/server";

import { getProviderBySlug } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

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

function normalizeMapUrl(value?: string | null) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  try {
    if (/^https?:\/\//i.test(cleanValue)) {
      return new URL(cleanValue).toString();
    }

    if (
      cleanValue.startsWith("www.google.com/maps") ||
      cleanValue.startsWith("google.com/maps") ||
      cleanValue.startsWith("maps.google.com") ||
      cleanValue.startsWith("maps.app.goo.gl") ||
      cleanValue.startsWith("goo.gl/maps") ||
      cleanValue.startsWith("maps.apple.com")
    ) {
      return new URL(`https://${cleanValue}`).toString();
    }

    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(cleanValue)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cleanValue
      )}`;
    }

    return null;
  } catch {
    return null;
  }
}

function readMapUrlFromText(value?: string | null) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  const directUrl = normalizeMapUrl(cleanValue);

  if (directUrl) return directUrl;

  const match = cleanValue.match(
    /(https?:\/\/(?:www\.)?google\.com\/maps[^\s،]+|https?:\/\/maps\.google\.com[^\s،]+|https?:\/\/maps\.app\.goo\.gl[^\s،]+|https?:\/\/goo\.gl\/maps[^\s،]+|https?:\/\/maps\.apple\.com[^\s،]+)/i
  );

  if (!match?.[0]) return null;

  return normalizeMapUrl(match[0]);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const baseUrl = getBaseUrl(request);

    const provider = await getProviderBySlug(slug);

    if (!provider) {
      return NextResponse.json(
        {
          ok: false,
          message: "مقدم الخدمة غير موجود"
        },
        { status: 404 }
      );
    }

    const whatsappNumber = provider.whatsapp || provider.phone;
    const displayName = [provider.titlePrefix, provider.name]
      .filter(Boolean)
      .join(" ");

    const mapUrl =
      normalizeMapUrl(provider.mapurl) ?? readMapUrlFromText(provider.address);

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
        governorate: provider.governorate?.name ?? null,

        areaId: provider.areaId,
        area: provider.area?.name ?? null,

        bio: provider.bio,
        imageUrl: normalizeAssetUrl(provider.imageUrl, baseUrl),

        phone: provider.phone,
        phoneUrl: buildTelUrl(provider.phone),

        whatsapp: provider.whatsapp,
        instagramUrl: provider.instagramUrl,

        whatsappUrl: buildWhatsappUrl(
          whatsappNumber,
          `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${displayName}.`
        ),

        address: provider.address,
        mapUrl,

        workingHours: provider.workingHours,
        bookingPoints: provider.bookingPoints,
        isFeatured: provider.isFeatured,

        offers: (provider.offers ?? []).map((offer) => ({
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          description: offer.description,
          imageUrl: normalizeAssetUrl(offer.imageUrl, baseUrl),
          discountText: offer.discountText,
          startsAt: offer.startsAt,
          endsAt: offer.endsAt
        }))
      }
    });
  } catch (error) {
    console.error("Mobile provider details API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب تفاصيل مقدم الخدمة"
      },
      { status: 500 }
    );
  }
}