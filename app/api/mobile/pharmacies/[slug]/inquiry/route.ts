import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  getPublicPharmacyBySlug,
  incrementPharmacyInquiryCount,
} from "@/lib/queries";
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
    `رابط الصفحة: ${input.profileUrl}`,
  ].filter(Boolean);

  return lines.join("\n");
}

async function handleInquiry(
  request: NextRequest,
  slug: string,
  responseType: "redirect" | "json"
) {
  const baseUrl = getBaseUrl(request);
  const siteUrl = getSiteUrl(baseUrl);

  const pharmacy = await getPublicPharmacyBySlug(slug);

  if (!pharmacy) {
    if (responseType === "redirect") {
      return NextResponse.redirect(`${siteUrl}/pharmacies`);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "الصيدلية غير موجودة",
      },
      { status: 404 }
    );
  }

  const profileUrl = `${siteUrl}/pharmacies/${pharmacy.slug}`;

  const whatsappUrl = buildWhatsappUrl(
    pharmacy.whatsapp,
    buildPharmacyWhatsappMessage({
      name: pharmacy.name,
      governorate: pharmacy.governorate?.name,
      area: pharmacy.area?.name,
      address: pharmacy.address,
      services: pharmacy.services,
      workingHours: pharmacy.workingHours,
      profileUrl,
    })
  );

  if (!whatsappUrl) {
    if (responseType === "redirect") {
      return NextResponse.redirect(profileUrl);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "واتساب غير متوفر لهذه الصيدلية",
      },
      { status: 400 }
    );
  }

  await incrementPharmacyInquiryCount(slug);

  revalidatePath("/pharmacies");
  revalidatePath(`/pharmacies/${pharmacy.slug}`);

  const nextInquiryCount = (pharmacy.inquiryCount ?? 0) + 1;

  if (responseType === "redirect") {
    return NextResponse.redirect(whatsappUrl);
  }

  return NextResponse.json({
    ok: true,
    type: "pharmacy",
    slug: pharmacy.slug,
    inquiryCount: nextInquiryCount,
    whatsappUrl,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  return handleInquiry(request, decodeURIComponent(slug), "redirect");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  return handleInquiry(request, decodeURIComponent(slug), "json");
}