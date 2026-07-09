import { NextRequest, NextResponse } from "next/server";

import { getPublicLabs } from "@/lib/queries";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = getBaseUrl(request);

    const labs = await getPublicLabs({
      q: searchParams.get("q") ?? undefined,
      governorateId:
        searchParams.get("governorateId") ??
        searchParams.get("governorate") ??
        undefined,
      areaId:
        searchParams.get("areaId") ?? searchParams.get("area") ?? undefined
    });

    return NextResponse.json({
      ok: true,
      count: labs.length,
      items: labs.map((lab: (typeof labs)[number]) => {
        const mapUrl =
          normalizeMapUrl(lab.mapurl) ?? readMapUrlFromText(lab.address);

        return {
          id: lab.id,
          name: lab.name,
          slug: lab.slug,

          governorateId: lab.governorateId,
          governorate: lab.governorate?.name ?? null,

          areaId: lab.areaId,
          area: lab.area?.name ?? null,

          services: lab.services,
          imageUrl: normalizeAssetUrl(lab.imageUrl, baseUrl),

          phone: lab.phone,
          phoneUrl: buildTelUrl(lab.phone),

          whatsapp: lab.whatsapp,
          whatsappUrl: buildWhatsappUrl(
            lab.whatsapp,
            `مرحبا، وصلت لكم من تطبيق طب نت وأرغب بالاستفسار من ${lab.name}.`
          ),

          address: lab.address,
          mapUrl,

          workingHours: lab.workingHours,
          isFeatured: lab.isFeatured
        };
      })
    });
  } catch (error) {
    console.error("Mobile labs API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء جلب المختبرات"
      },
      { status: 500 }
    );
  }
}