import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

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
    "مرحبا، وصلت لكم من تطبيق طب نت وأرغب بحجز موعد.",
    "",
    `الطبيب/الجهة: ${input.providerTitlePrefix} ${input.providerName}`,
    `اسم المراجع: ${input.patientName}`,
    `رقم الهاتف: ${input.patientPhone}`,
    `اليوم والوقت المناسب: ${input.preferredDate || "لم يتم تحديده"}`,
    input.note ? `ملاحظة: ${input.note}` : null,
    "",
    `رابط الصفحة: ${input.providerUrl}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          message: "البيانات المرسلة غير صحيحة",
        },
        { status: 400 }
      );
    }

    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "تحقق من البيانات",
        },
        { status: 400 }
      );
    }

    const providerId = parsed.data.providerId;

    if (!providerId) {
      return NextResponse.json(
        {
          ok: false,
          message: "بيانات مقدم الخدمة غير مكتملة",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const provider = await tx.provider.findFirst({
        where: {
          id: providerId,
          status: "ACTIVE",
          governorate: {
            isActive: true,
          },
          area: {
            isActive: true,
          },
        },
        select: {
          id: true,
          name: true,
          titlePrefix: true,
          slug: true,
          type: true,
          whatsapp: true,
          phone: true,
        },
      });

      if (!provider) {
        throw new Error("مقدم الخدمة غير موجود أو غير فعال");
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
        providerUrl,
      });

      const whatsappUrl = buildWhatsappUrl(whatsappNumber, message);

      if (!whatsappUrl) {
        throw new Error("لا يوجد رقم واتساب أو هاتف صحيح لهذا الطبيب");
      }

      const appointment = await tx.appointment.create({
        data: {
          providerId: provider.id,
          patientName: parsed.data.patientName,
          patientPhone: parsed.data.patientPhone,
          preferredDate: parsed.data.preferredDate || null,
          note: parsed.data.note || null,
          status: "NEW",
        },
        select: {
          id: true,
          patientName: true,
          patientPhone: true,
          preferredDate: true,
          note: true,
          createdAt: true,
        },
      });

      const updatedProvider = await tx.provider.update({
        where: {
          id: provider.id,
        },
        data: {
          bookingPoints: {
            increment: 1,
          },
        },
        select: {
          id: true,
          slug: true,
          bookingPoints: true,
        },
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
          },
        },
      });

      return {
        appointmentId: appointment.id,
        providerSlug: provider.slug,
        whatsappUrl,
      };
    });

    revalidatePath("/admin/appointments");
    revalidatePath("/admin/providers");
    revalidatePath("/doctors");
    revalidatePath("/dentists");
    revalidatePath(`/providers/${result.providerSlug}`);

    return NextResponse.json({
      ok: true,
      message: "تم تسجيل طلب الموعد وتجهيز رابط واتساب",
      appointmentId: result.appointmentId,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (error) {
    console.error("Mobile appointments API error", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "صار خطأ أثناء إرسال طلب الموعد",
      },
      { status: 500 }
    );
  }
}