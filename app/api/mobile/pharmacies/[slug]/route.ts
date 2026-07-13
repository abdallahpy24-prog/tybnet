import { NextRequest, NextResponse } from "next/server";

import { getPublicPharmacyBySlug } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function getBaseUrl(request: NextRequest) {
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

function getSiteUrl(baseUrl: string) {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    baseUrl
  ).replace(/\/$/, "");
}

function cleanText(value?: string | null) {
  return String(value || "").trim();
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

function buildPharmacySummary(input: {
  name: string;
  bio?: string | null;
  services?: string | null;
  governorate?: string | null;
  area?: string | null;
  address?: string | null;
  workingHours?: string | null;
}) {
  if (input.bio?.trim()) {
    return input.bio.trim();
  }

  const location = [input.governorate, input.area]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const lines = [
    `صيدلية ${input.name}${location ? ` في ${location}` : ""}.`,
    input.services ? `الخدمات: ${input.services}` : null,
    input.address ? `العنوان: ${input.address}` : null,
    input.workingHours ? `أوقات العمل: ${input.workingHours}` : null,
    "يمكنك الاستفسار عن توفر الأدوية والخدمات عبر واتساب أو الاتصال السريع عند توفر بيانات التواصل."
  ].filter(Boolean);

  return lines.join("\n");
}

function buildPharmacyWhatsappMessage(input: {
  name: string;
  governorate?: string | null;
  area?: string | null;
  address?: string | null;
  services?: string | null;
  workingHours?: string | null;
  profileUrl: string;
}) {
  const location = [input.governorate, input.area]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const lines = [
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن دواء أو خدمة.",
    "",
    `الصيدلية: ${input.name}`,
    location ? `المنطقة: ${location}` : null,
    input.address ? `العنوان: ${input.address}` : null,
    input.services ? `الخدمات: ${input.services}` : null,
    input.workingHours ? `أوقات العمل: ${input.workingHours}` : null,
    "",
    `رابط الصفحة: ${input.profileUrl}`
  ].filter(Boolean);

  return lines.join("\n");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const cleanSlug = decodeURIComponent(slug);

    const baseUrl = getBaseUrl(request);
    const siteUrl = getSiteUrl(baseUrl);

    const pharmacy = await getPublicPharmacyBySlug(cleanSlug);

    if (!pharmacy) {
      return NextResponse.json(
        {
          ok: false,
          message: "الصيدلية غير موجودة"
        },
        { status: 404 }
      );
    }

    const governorateName = pharmacy.governorate?.name ?? "غير محددة";
    const areaName = pharmacy.area?.name ?? "غير محددة";

    const profilePath = `/pharmacies/${pharmacy.slug}`;
    const profileUrl = `${siteUrl}${profilePath}`;
    const inquiryUrl = `${baseUrl}/api/mobile/pharmacies/${pharmacy.slug}/inquiry`;

    const mapUrl =
      normalizeMapUrl(pharmacy.mapurl) ?? readMapUrlFromText(pharmacy.address);

    const whatsappMessage = buildPharmacyWhatsappMessage({
      name: pharmacy.name,
      governorate: governorateName,
      area: areaName,
      address: pharmacy.address,
      services: pharmacy.services,
      workingHours: pharmacy.workingHours,
      profileUrl
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: pharmacy.id,
        type: "pharmacy",
        kindLabel: "صيدلية",

        name: pharmacy.name,
        slug: pharmacy.slug,

        governorateId: pharmacy.governorateId,
        governorate: governorateName,

        areaId: pharmacy.areaId,
        area: areaName,

        bio: pharmacy.bio,
        services: pharmacy.services,

        imageUrl: normalizeAssetUrl(pharmacy.imageUrl, baseUrl),

        phone: pharmacy.phone,
        phoneUrl: buildTelUrl(pharmacy.phone),

        whatsapp: pharmacy.whatsapp,
        whatsappUrl: buildWhatsappUrl(pharmacy.whatsapp, whatsappMessage),

        address: pharmacy.address,
        mapUrl,

        workingHours: pharmacy.workingHours,
        isFeatured: pharmacy.isFeatured,
        inquiryCount: pharmacy.inquiryCount,

        profileUrl,
        detailsUrl: profileUrl,
        shareUrl: profileUrl,
        inquiryUrl,

        summary: buildPharmacySummary({
          name: pharmacy.name,
          bio: pharmacy.bio,
          services: pharmacy.services,
          governorate: governorateName,
          area: areaName,
          address: pharmacy.address,
          workingHours: pharmacy.workingHours
        }),

        primaryActionLabel: "استفسار",
        detailsActionLabel: "التفاصيل",
        secondaryActionLabel: "اتصال سريع",
        mapActionLabel: "الموقع"
      }
    });
  } catch (error) {
    console.error("Mobile pharmacy details API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب بيانات الصيدلية"
      },
      { status: 500 }
    );
  }
}
