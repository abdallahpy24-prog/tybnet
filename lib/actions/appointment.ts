"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

class AppointmentRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentRequestError";
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

function buildAppointmentMessage(input: {
  providerName: string;
  providerTitlePrefix: string;
  patientName: string;
  patientPhone: string;
  preferredDate?: string | null;
  note?: string | null;
  providerUrl: string;
}) {
  const lines = [
    "مرحبا، وصلت لكم من منصة طب نت وأرغب بحجز موعد.",
    "",
    `الطبيب/الجهة: ${input.providerTitlePrefix} ${input.providerName}`,
    `اسم المراجع: ${input.patientName}`,
    `رقم الهاتف: ${input.patientPhone}`,
    `اليوم والوقت المناسب: ${input.preferredDate || "لم يتم تحديده"}`,
    input.note ? `ملاحظة: ${input.note}` : null,
    "",
    `رابط الصفحة: ${input.providerUrl}`
  ].filter(Boolean);

  return lines.join("\n");
}

export async function createAppointment(
  _prevState: unknown,
  formData: FormData
) {
  const privacyConsent = formData.get("privacyConsent");

  if (privacyConsent !== "yes") {
    return {
      ok: false,
      message: "يجب الموافقة على سياسة الخصوصية قبل إرسال طلب الموعد"
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "تحقق من البيانات"
    };
  }

  const providerId = parsed.data.providerId;

  if (!providerId) {
    return {
      ok: false,
      message: "بيانات الطبيب غير مكتملة"
    };
  }

  try {
    const provider = await prisma.provider.findFirst({
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
        "الطبيب غير موجود أو غير فعال"
      );
    }

    const whatsappNumber = provider.whatsapp || provider.phone;
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
        "لا يوجد رقم واتساب صحيح لهذا الطبيب. يرجى التواصل مع إدارة الموقع."
      );
    }

    const normalizedPhone = normalizePhoneForComparison(
      parsed.data.patientPhone
    );
    const duplicateWindowStart = new Date(
      Date.now() - DUPLICATE_WINDOW_MS
    );

    let created = false;
    let appointmentId: string | null = null;

    /*
     * التعديل هنا فقط:
     * أزلنا أوامر PostgreSQL الخام الخاصة بالقفل والـ rate limit لأنها كانت
     * تسبب فشل الطلب كله على بعض قواعد البيانات/الإعدادات.
     * بقي تسجيل الموعد وعرضه في الأدمن كما هو.
     */
    try {
      const recentAppointments = await prisma.appointment.findMany({
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

      if (!duplicate) {
        const appointment = await prisma.appointment.create({
          data: {
            providerId: provider.id,
            patientName: parsed.data.patientName,
            patientPhone: parsed.data.patientPhone,
            preferredDate: parsed.data.preferredDate || null,
            note: parsed.data.note || null,
            status: "NEW"
          },
          select: {
            id: true
          }
        });

        appointmentId = appointment.id;
        created = true;

        // هذه العمليات إضافية؛ فشلها لا يمنع فتح واتساب للمستخدم.
        try {
          const updatedProvider = await prisma.provider.update({
            where: {
              id: provider.id
            },
            data: {
              bookingPoints: {
                increment: 1
              }
            },
            select: {
              bookingPoints: true
            }
          });

          await prisma.auditLog.create({
            data: {
              userId: null,
              action: "create-whatsapp-appointment",
              entity: "Appointment",
              entityId: appointment.id,
              afterJson: {
                appointmentId: appointment.id,
                providerId: provider.id,
                providerName: provider.name,
                providerSlug: provider.slug,
                providerType: provider.type,
                patientName: parsed.data.patientName,
                patientPhone: parsed.data.patientPhone,
                preferredDate: parsed.data.preferredDate || null,
                bookingPoints: updatedProvider.bookingPoints,
                source: "public-whatsapp-form"
              }
            }
          });
        } catch (secondaryError) {
          console.error(
            "Appointment secondary operations error",
            secondaryError
          );
        }
      } else {
        appointmentId = duplicate.id;
      }
    } catch (storageError) {
      /*
       * إذا صار خلل مؤقت بجدول المواعيد أو السجل، لا نمنع المريض من فتح
       * رسالة واتساب. الخطأ يبقى ظاهراً في سجل السيرفر حتى يمكن إصلاحه.
       */
      console.error("Appointment storage error", storageError);
    }

    if (created) {
      revalidatePath("/admin/appointments");

      if (provider.type === "COSMETIC_DOCTOR") {
        revalidatePath("/admin/cosmetic-doctors");
        revalidatePath("/cosmetic-doctors");
      } else {
        revalidatePath("/admin/providers");

        if (provider.type === "DENTIST") {
          revalidatePath("/dentists");
        } else {
          revalidatePath("/doctors");
        }
      }

      revalidatePath(providerProfilePath);
    }

    return {
      ok: true,
      message: created
        ? "تم تسجيل طلب الموعد وتجهيز رسالة واتساب، سيتم تحويلك الآن"
        : appointmentId
          ? "تم استلام طلب مماثل مسبقاً، سيتم فتح رسالة واتساب بدون إضافة طلب جديد"
          : "تم تجهيز رسالة واتساب، سيتم تحويلك الآن",
      whatsappUrl
    };
  } catch (error) {
    console.error("Public appointment action error", error);

    return {
      ok: false,
      message:
        error instanceof AppointmentRequestError
          ? error.message
          : "صار خطأ أثناء إرسال طلب الموعد. حاول مرة ثانية."
    };
  }
}
