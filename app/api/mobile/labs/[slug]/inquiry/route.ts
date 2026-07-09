import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getPublicLabBySlug, incrementLabInquiryCount } from "@/lib/queries";
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

function buildLabWhatsappMessage(input: {
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
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن تحليل أو خدمة.",
    "",
    `المختبر: ${input.name}`,
    location ? `المنطقة: ${location}` : null,
    input.services ? `الخدمات: ${input.services}` : null,
    input.address ? `العنوان: ${input.address}` : null,
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

  const lab = await getPublicLabBySlug(slug);

  if (!lab) {
    if (responseType === "redirect") {
      return NextResponse.redirect(`${siteUrl}/labs`);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "المختبر غير موجود",
      },
      { status: 404 }
    );
  }

  const profileUrl = `${siteUrl}/labs/${lab.slug}`;

  const whatsappUrl = buildWhatsappUrl(
    lab.whatsapp,
    buildLabWhatsappMessage({
      name: lab.name,
      governorate: lab.governorate?.name,
      area: lab.area?.name,
      address: lab.address,
      services: lab.services,
      workingHours: lab.workingHours,
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
        message: "واتساب غير متوفر لهذا المختبر",
      },
      { status: 400 }
    );
  }

  await incrementLabInquiryCount(slug);

  revalidatePath("/labs");
  revalidatePath(`/labs/${lab.slug}`);

  const nextInquiryCount = (lab.inquiryCount ?? 0) + 1;

  if (responseType === "redirect") {
    return NextResponse.redirect(whatsappUrl);
  }

  return NextResponse.json({
    ok: true,
    type: "lab",
    slug: lab.slug,
    inquiryCount: nextInquiryCount,
    whatsappUrl,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  return handleInquiry(
    request,
    decodeURIComponent(context.params.slug),
    "redirect"
  );
}

export async function POST(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  return handleInquiry(request, decodeURIComponent(context.params.slug), "json");
}