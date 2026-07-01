"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";

export async function createAppointment(_prevState: unknown, formData: FormData) {
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

  let providerSlug: string | null = null;

  await prisma.$transaction(async (tx) => {
    await tx.appointment.create({
      data: {
        providerId: parsed.data.providerId || null,
        patientName: parsed.data.patientName,
        patientPhone: parsed.data.patientPhone,
        note: parsed.data.note || null,
        preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : null
      }
    });

    if (parsed.data.providerId) {
      const provider = await tx.provider.update({
        where: {
          id: parsed.data.providerId
        },
        data: {
          bookingPoints: {
            increment: 1
          }
        },
        select: {
          slug: true
        }
      });

      providerSlug = provider.slug;
    }
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin/providers");
  revalidatePath("/doctors");
  revalidatePath("/dentists");

  if (providerSlug) {
    revalidatePath(`/providers/${providerSlug}`);
  }

  return {
    ok: true,
    message: "تم إرسال طلب الموعد بنجاح"
  };
}