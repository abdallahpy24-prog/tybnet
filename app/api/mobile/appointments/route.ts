import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getInquiryFingerprint } from "@/lib/inquiry-protection";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_APPOINTMENTS_PER_WINDOW = 30;
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

async function readJsonBody(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (!contentType.startsWith("application/json")) {
    throw new AppointmentRequestError(
      "نوع البيانات المرسلة غير مدعوم",
      415
    );
  }

  const contentLengthValue = request.headers.get("content-length");
  const contentLength = contentLengthValue
    ? Number(contentLengthValue)
    : null;

  if (
    contentLength !== null &&
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BYTES
  ) {
    throw new AppointmentRequestError(
      "حجم البيانات المرسلة كبير جداً",
      413
    );
  }

  if (!request.body) {
    return null;
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new AppointmentRequestError(
          "حجم البيانات المرسلة كبير جداً",
          413
        );
      }

      text += decoder.decode(value, {
        stream: true
      });
    }

    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://tybnet.com"
  ).replace(/\/$/, "");
}

function getProviderProfilePath(
  providerType: "DOCTOR" | "DENTIST" | "COSMETIC_DOCTOR",
  slug: string
) {
  if (providerType === "COSMETIC_DOCTOR") {
    return `/cosmetic-doctors/${slug}`;
  }

  return `/providers/${slug}`;
}

function normalizePhoneForComparison(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("00964")) {
    return digits.slice(2);
  }

  if (digits.startsWith("964")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `964${digits.slice(1)}`;
  }

  return digits;
}

function cleanLine(value?: string | null) {
  return String(value || "").trim();
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
  const providerFullName =
    `${input.providerTitlePrefix} ${input.providerName}`.trim();

  const preferredDate =
    cleanLine(input.preferredDate) || "لم يتم تحديده";

  const note = cleanLine(input.note);

  const lines = [
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بحجز موعد.",
    "",
    `الطبيب/الجهة: ${providerFullName}`,
    `اسم المراجع: ${input.patientName}`,
    `رقم الهاتف: ${input.patientPhone}`,
    `الموعد المفضل: ${preferredDate}`,
    note ? `ملاحظة: ${note}` : null,
    "",
    `رابط الصفحة: ${input.providerUrl}`
  ].filter(Boolean);

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          message: "البيانات المرسلة غير صحيحة"
        },
        {
          status: 400
        }
      );
    }

    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "تحقق من البيانات"
        },
        {
          status: 400
        }
      );
    }

    const providerId = parsed.data.providerId;

    if (!providerId) {
      return NextResponse.json(
        {
          ok: false,
          message: "بيانات مقدم الخدمة غير مكتملة"
        },
        {
          status: 400
        }
      );
    }

    const normalizedPhone = normalizePhoneForComparison(
      parsed.data.patientPhone
    );
    const fingerprint = getInquiryFingerprint(request);

    const result = await prisma.$transaction(async (tx) => {
      if (fingerprint) {
        const rateLockKey = `mobile-appointment-rate:${fingerprint}`;

        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtextextended(${rateLockKey}, 0))
        `;

        const rateWindowStart = new Date(
          Date.now() - RATE_LIMIT_WINDOW_MS
        );

        const rows = await tx.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int AS "count"
          FROM "AuditLog"
          WHERE "action" = 'create-mobile-appointment'
            AND "entity" = 'Appointment'
            AND "createdAt" >= ${rateWindowStart}
            AND "afterJson"->>'fingerprint' = ${fingerprint}
        `;

        if ((rows[0]?.count ?? 0) >= MAX_APPOINTMENTS_PER_WINDOW) {
          throw new AppointmentRequestError(
            "تم إرسال عدد كبير من الطلبات. حاول مرة أخرى لاحقاً",
            429
          );
        }
      }

      const provider = await tx.provider.findFirst({
        where: {
          id: providerId,
          status: "ACTIVE",
          governorate: {
            isActive: true
          },
          area: {
            isActive: true
          }
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
        throw new AppointmentRequestError(
          "مقدم الخدمة غير موجود أو غير فعال",
          404
        );
      }

      const whatsappNumber = provider.whatsapp || provider.phone;

      if (!whatsappNumber) {
        throw new AppointmentRequestError(
          "لا يوجد رقم واتساب أو هاتف صحيح لهذا الطبيب",
          422
        );
      }

      const providerProfilePath = getProviderProfilePath(
        provider.type,
        provider.slug
      );

      const providerUrl = `${getSiteUrl()}${providerProfilePath}`;

      const message = buildAppointmentMessage({
        providerName: provider.name,
        providerTitlePrefix: provider.titlePrefix,
        patientName: parsed.data.patientName,
        patientPhone: parsed.data.patientPhone,
        preferredDate: parsed.data.preferredDate || null,
        note: parsed.data.note || null,
        providerUrl
      });

      const whatsappUrl = buildWhatsappUrl(whatsappNumber, message);

      if (!whatsappUrl) {
        throw new AppointmentRequestError(
          "لا يوجد رقم واتساب أو هاتف صحيح لهذا الطبيب",
          422
        );
      }

      const lockKey = `appointment:${provider.id}:${normalizedPhone}`;

      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
      `;

      const duplicateWindowStart = new Date(
        Date.now() - DUPLICATE_WINDOW_MS
      );

      const recentAppointments = await tx.appointment.findMany({
        where: {
          providerId: provider.id,
          createdAt: {
            gte: duplicateWindowStart
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 200,
        select: {
          id: true,
          patientPhone: true
        }
      });

      const duplicate = recentAppointments.find(
        (appointment) =>
          normalizePhoneForComparison(appointment.patientPhone) ===
          normalizedPhone
      );

      if (duplicate) {
        return {
          created: false,
          appointmentId: duplicate.id,
          providerType: provider.type,
          providerProfilePath,
          whatsappUrl
        };
      }

      const appointment = await tx.appointment.create({
        data: {
          providerId: provider.id,
          patientName: parsed.data.patientName,
          patientPhone: parsed.data.patientPhone,
          preferredDate: parsed.data.preferredDate || null,
          note: parsed.data.note || null,
          status: "NEW"
        },
        select: {
          id: true,
          patientName: true,
          patientPhone: true,
          preferredDate: true,
          note: true,
          createdAt: true
        }
      });

      const updatedProvider = await tx.provider.update({
        where: {
          id: provider.id
        },
        data: {
          bookingPoints: {
            increment: 1
          }
        },
        select: {
          id: true,
          slug: true,
          bookingPoints: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: null,
          action: "create-mobile-appointment",
          entity: "Appointment",
          entityId: appointment.id,
          afterJson: {
            appointmentId: appointment.id,
            providerId: provider.id,
            providerName: provider.name,
            providerSlug: provider.slug,
            providerType: provider.type,
            patientName: appointment.patientName,
            patientPhone: appointment.patientPhone,
            preferredDate: appointment.preferredDate,
            note: appointment.note,
            bookingPoints: updatedProvider.bookingPoints,
            source: "mobile-api",
            fingerprint
          }
        }
      });

      return {
        created: true,
        appointmentId: appointment.id,
        providerType: provider.type,
        providerProfilePath,
        whatsappUrl
      };
    });

    if (result.created) {
      revalidatePath("/admin/appointments");

      if (result.providerType === "COSMETIC_DOCTOR") {
        revalidatePath("/admin/cosmetic-doctors");
        revalidatePath("/cosmetic-doctors");
      } else {
        revalidatePath("/admin/providers");

        if (result.providerType === "DENTIST") {
          revalidatePath("/dentists");
        } else {
          revalidatePath("/doctors");
        }
      }

      revalidatePath(result.providerProfilePath);
    }

    return NextResponse.json({
      ok: true,
      message: result.created
        ? "تم تسجيل طلب الموعد وتجهيز رابط واتساب"
        : "تم استلام طلب مماثل مسبقاً، سيتم فتح واتساب بدون إضافة طلب جديد",
      appointmentId: result.appointmentId,
      whatsappUrl: result.whatsappUrl
    });
  } catch (error) {
    console.error("Mobile appointments API error", error);

    if (error instanceof AppointmentRequestError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        {
          status: error.status,
          headers:
            error.status === 429
              ? {
                  "Retry-After": "3600"
                }
              : undefined
        }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "صار خطأ أثناء إرسال طلب الموعد"
      },
      {
        status: 500
      }
    );
  }
}
