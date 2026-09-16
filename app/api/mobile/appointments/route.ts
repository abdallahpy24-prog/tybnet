import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { readJsonBodyWithLimit } from "@/lib/http-body";
import { storeAppointmentSafely } from "@/lib/appointments";
import { logServerError } from "@/lib/server-error";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16 * 1024;

class AppointmentRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AppointmentRequestError";
  }
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com"
  ).replace(/\/$/, "");
}

function getProviderProfilePath(
  providerType: "DOCTOR" | "DENTIST" | "COSMETIC_DOCTOR",
  slug: string
) {
  return providerType === "COSMETIC_DOCTOR"
    ? `/cosmetic-doctors/${slug}`
    : `/providers/${slug}`;
}

function buildAppointmentMessage(input: {
  providerName: string;
  providerTitlePrefix: string;
  patientName: string;
  patientPhone: string;
  preferredDate?: string | null;
  note?: string | null;
  providerUrl: string;
}) {
  const fullName = `${input.providerTitlePrefix} ${input.providerName}`.trim();

  return [
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بطلب موعد.",
    "",
    `الطبيب/الجهة: ${fullName}`,
    `اسم المراجع: ${input.patientName}`,
    `رقم الهاتف: ${input.patientPhone}`,
    `الموعد المفضل: ${input.preferredDate || "لم يتم تحديده"}`,
    input.note ? `ملاحظة: ${input.note}` : null,
    "",
    `رابط الصفحة: ${input.providerUrl}`
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const bodyResult = await readJsonBodyWithLimit(request, MAX_REQUEST_BYTES);
    if (!bodyResult.ok) {
      return jsonResponse(
        { ok: false, message: bodyResult.message },
        { status: bodyResult.status }
      );
    }
    const body = bodyResult.body;

    if (!body) {
      return jsonResponse(
        { ok: false, message: "البيانات المرسلة غير صحيحة" },
        { status: 400 }
      );
    }

    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "تحقق من البيانات",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    if (!parsed.data.providerId) {
      return jsonResponse(
        { ok: false, message: "بيانات مقدم الخدمة غير مكتملة" },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.findFirst({
      where: {
        id: parsed.data.providerId,
        status: "ACTIVE",
        governorate: { isActive: true },
        area: { isActive: true }
      },
      select: {
        id: true,
        name: true,
        titlePrefix: true,
        slug: true,
        type: true,
        whatsapp: true,
        phone: true
      }
    });

    if (!provider) {
      throw new AppointmentRequestError("مقدم الخدمة غير موجود أو غير فعال", 404);
    }

    const profilePath = getProviderProfilePath(provider.type, provider.slug);
    const message = buildAppointmentMessage({
      providerName: provider.name,
      providerTitlePrefix: provider.titlePrefix || "",
      patientName: parsed.data.patientName,
      patientPhone: parsed.data.patientPhone,
      preferredDate: parsed.data.preferredDate || null,
      note: parsed.data.note || null,
      providerUrl: `${getSiteUrl()}${profilePath}`
    });
    const whatsappUrl = buildWhatsappUrl(provider.whatsapp, message) || buildWhatsappUrl(provider.phone, message);

    if (!whatsappUrl) {
      throw new AppointmentRequestError(
        "لا يوجد رقم واتساب أو هاتف صحيح لهذا الطبيب",
        422
      );
    }

    let stored:
      | Awaited<ReturnType<typeof storeAppointmentSafely>>
      | null = null;

    try {
      stored = await storeAppointmentSafely({
        providerId: provider.id,
        patientName: parsed.data.patientName,
        patientPhone: parsed.data.patientPhone,
        preferredDate: parsed.data.preferredDate || null,
        note: parsed.data.note || null,
        source: "mobile-api"
      });
    } catch (storageError) {
      logServerError("Mobile appointment storage error", storageError);
    }

    if (stored?.saved) {
      revalidatePath("/admin/appointments");
      revalidatePath(profilePath);
    }

    return jsonResponse({
      ok: true,
      saved: Boolean(stored?.saved),
      duplicate: Boolean(stored?.duplicate),
      rateLimited: Boolean(stored?.rateLimited),
      appointmentId: stored?.appointmentId ?? null,
      message: stored?.saved
        ? "تم حفظ طلب الموعد وتجهيز رابط واتساب"
        : stored?.duplicate
          ? "يوجد طلب مماثل محفوظ حديثاً؛ جُهز رابط واتساب بدون سجل مكرر"
          : stored?.rateLimited
            ? "لم نُنشئ سجلاً جديداً بسبب كثرة الطلبات خلال مدة قصيرة؛ رابط واتساب ما زال متاحاً"
            : "تعذر حفظ الطلب مؤقتاً؛ رابط واتساب ما زال متاحاً",
      whatsappUrl,
      whatsappMessage: message
    });
  } catch (error) {
    logServerError("Mobile appointments API error", error);

    if (error instanceof AppointmentRequestError) {
      return jsonResponse(
        { ok: false, message: error.message },
        { status: error.status }
      );
    }

    return jsonResponse(
      { ok: false, message: "تعذر تجهيز طلب الموعد. يُرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}
