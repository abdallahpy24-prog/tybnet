"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";

export async function createAppointment(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من البيانات" };
  }

  await prisma.appointment.create({
    data: {
      providerId: parsed.data.providerId || null,
      patientName: parsed.data.patientName,
      patientPhone: parsed.data.patientPhone,
      note: parsed.data.note || null,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : null
    }
  });

  revalidatePath("/admin/appointments");
  return { ok: true, message: "تم إرسال طلب الموعد بنجاح" };
}
