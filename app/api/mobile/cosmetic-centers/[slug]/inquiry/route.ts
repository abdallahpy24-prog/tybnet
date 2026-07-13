import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  getInquiryFingerprint,
  inquiryWasRecentlyCounted,
  recordInquiry
} from "@/lib/inquiry-protection";
import { prisma } from "@/lib/prisma";
import { getPublicCosmeticCenterBySlug } from "@/lib/queries";
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

function readSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return "";
  }
}

function buildCosmeticCenterWhatsappMessage(input: {
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
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن خدمة تجميلية أو موعد.",
    "",
    `مركز التجميل: ${input.name}`,
    location ? `المنطقة: ${location}` : null,
    input.services ? `الخدمات: ${input.services}` : null,
    input.address ? `العنوان: ${input.address}` : null,
    input.workingHours ? `أوقات العمل: ${input.workingHours}` : null,
    "",
    `رابط الصفحة: ${input.profileUrl}`
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
  const center = await getPublicCosmeticCenterBySlug(slug);

  if (!center) {
    if (responseType === "redirect") {
      return NextResponse.redirect(`${siteUrl}/cosmetic-centers`);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "مركز التجميل غير موجود"
      },
      { status: 404 }
    );
  }

  const profileUrl = `${siteUrl}/cosmetic-centers/${center.slug}`;

  const whatsappUrl = buildWhatsappUrl(
    center.whatsapp,
    buildCosmeticCenterWhatsappMessage({
      name: center.name,
      governorate: center.governorate?.name,
      area: center.area?.name,
      address: center.address,
      services: center.services,
      workingHours: center.workingHours,
      profileUrl
    })
  );

  if (!whatsappUrl) {
    if (responseType === "redirect") {
      return NextResponse.redirect(profileUrl);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "واتساب غير متوفر لهذا المركز"
      },
      { status: 400 }
    );
  }

  const fingerprint = getInquiryFingerprint(request);

  const result = await prisma.$transaction(async (tx) => {
    const duplicate = await inquiryWasRecentlyCounted(tx, {
      entity: "CosmeticCenter",
      entityId: center.id,
      fingerprint
    });

    if (duplicate) {
      const current = await tx.cosmeticCenter.findUnique({
        where: {
          id: center.id
        },
        select: {
          inquiryCount: true
        }
      });

      return {
        incremented: false,
        inquiryCount: current?.inquiryCount ?? center.inquiryCount
      };
    }

    const updated = await tx.cosmeticCenter.update({
      where: {
        id: center.id
      },
      data: {
        inquiryCount: {
          increment: 1
        }
      },
      select: {
        inquiryCount: true
      }
    });

    await recordInquiry(tx, {
      entity: "CosmeticCenter",
      entityId: center.id,
      fingerprint,
      inquiryCount: updated.inquiryCount,
      source: responseType === "json" ? "mobile-api" : "public-redirect"
    });

    return {
      incremented: true,
      inquiryCount: updated.inquiryCount
    };
  });

  if (result.incremented) {
    revalidatePath("/cosmetic-centers");
    revalidatePath(`/cosmetic-centers/${center.slug}`);
    revalidatePath("/api/mobile/cosmetic-centers");
    revalidatePath(`/api/mobile/cosmetic-centers/${center.slug}`);
  }

  if (responseType === "redirect") {
    return NextResponse.redirect(whatsappUrl);
  }

  return NextResponse.json({
    ok: true,
    type: "cosmetic_center",
    slug: center.slug,
    inquiryCount: result.inquiryCount,
    whatsappUrl
  });
}

async function respond(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
  responseType: "redirect" | "json"
) {
  const baseUrl = getBaseUrl(request);
  const siteUrl = getSiteUrl(baseUrl);

  try {
    const { slug } = await context.params;
    const cleanSlug = readSlug(slug);

    if (!cleanSlug) {
      if (responseType === "redirect") {
        return NextResponse.redirect(`${siteUrl}/cosmetic-centers`);
      }

      return NextResponse.json(
        {
          ok: false,
          message: "رابط مركز التجميل غير صحيح"
        },
        { status: 400 }
      );
    }

    return await handleInquiry(request, cleanSlug, responseType);
  } catch (error) {
    console.error("Cosmetic center inquiry API error", error);

    if (responseType === "redirect") {
      return NextResponse.redirect(`${siteUrl}/cosmetic-centers`);
    }

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء فتح استفسار مركز التجميل"
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  return respond(request, context, "redirect");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  return respond(request, context, "json");
}
