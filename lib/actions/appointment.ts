"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://tybnet.com"
  ).replace(/\/$/, "");
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

  const result = await prisma.$transaction(async (tx) => {
    const provider = await tx.provider.findUnique({
      where: {
        id: providerId
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
      throw new Error("الطبيب غير موجود");
    }

    const whatsappNumber = provider.whatsapp || provider.phone;

    const providerUrl = `${getSiteUrl()}/providers/${provider.slug}`;

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
      throw new Error(
        "لا يوجد رقم واتساب صحيح لهذا الطبيب. يرجى التواصل مع إدارة الموقع."
      );
    }

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
        action: "whatsapp-appointment-request",
        entity: "Provider",
        entityId: provider.id,
        afterJson: {
          providerId: provider.id,
          providerName: provider.name,
          providerSlug: provider.slug,
          providerType: provider.type,
          bookingPoints: updatedProvider.bookingPoints,
          source: "public-whatsapp-form"
        }
      }
    });

    return {
      providerSlug: provider.slug,
      whatsappUrl
    };
  });

  revalidatePath("/admin/providers");
  revalidatePath("/admin/appointments");
  revalidatePath("/doctors");
  revalidatePath("/dentists");
  revalidatePath(`/providers/${result.providerSlug}`);

  return {
    ok: true,
    message: "تم تجهيز رسالة واتساب، سيتم تحويلك الآن",
    whatsappUrl: result.whatsappUrl
  };
}