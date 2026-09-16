"use server";

import { revalidatePath } from "next/cache";

import { storeAppointmentSafely } from "@/lib/appointments";
import { logServerError } from "@/lib/server-error";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export type AppointmentActionState = {
  ok: boolean;
  message: string;
  saved?: boolean;
  duplicate?: boolean;
  rateLimited?: boolean;
  appointmentId?: string | null;
  whatsappUrl?: string;
  whatsappMessage?: string;
  fieldErrors?: Partial<
    Record<"patientName" | "patientPhone" | "preferredDate" | "note" | "privacyConsent", string>
  >;
};

class AppointmentRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentRequestError";
  }
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
  const providerFullName =
    `${input.providerTitlePrefix} ${input.providerName}`.trim();

  return [
    "مرحباً، وصلت لكم عن طريق طب نت وأرغب بطلب موعد.",
    "",
    `الطبيب/الجهة: ${providerFullName}`,
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

function firstFieldErrors(error: {
  flatten: () => {
    fieldErrors: Record<string, string[] | undefined>;
  };
}) {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.[0])
      .map(([field, messages]) => [field, messages?.[0]])
  ) as AppointmentActionState["fieldErrors"];
}

export async function createAppointment(
  _prevState: AppointmentActionState | null,
  formData: FormData
): Promise<AppointmentActionState> {
  if (formData.get("privacyConsent") !== "yes") {
    return {
      ok: false,
      message: "يجب الموافقة على سياسة الخصوصية قبل تجهيز الطلب.",
      fieldErrors: {
        privacyConsent: "الموافقة مطلوبة للمتابعة."
      }
    };
  }

  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      message: "تحقق من الحقول الموضحة ثم حاول مجدداً.",
      fieldErrors: firstFieldErrors(parsed.error)
    };
  }

  if (!parsed.data.providerId) {
    return {
      ok: false,
      message: "بيانات الطبيب غير مكتملة."
    };
  }

  try {
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
      throw new AppointmentRequestError("الطبيب غير موجود أو غير متاح حالياً.");
    }

    const providerProfilePath = getProviderProfilePath(provider.type, provider.slug);
    const message = buildAppointmentMessage({
      providerName: provider.name,
      providerTitlePrefix: provider.titlePrefix || "",
      patientName: parsed.data.patientName,
      patientPhone: parsed.data.patientPhone,
      preferredDate: parsed.data.preferredDate || null,
      note: parsed.data.note || null,
      providerUrl: `${getSiteUrl()}${providerProfilePath}`
    });
    const whatsappUrl = buildWhatsappUrl(provider.whatsapp, message) || buildWhatsappUrl(provider.phone, message);

    if (!whatsappUrl) {
      throw new AppointmentRequestError(
        "لا يوجد رقم واتساب صالح لهذا الطبيب حالياً. يمكنك استخدام رقم الاتصال الظاهر في الملف."
      );
    }

    let storageResult:
      | Awaited<ReturnType<typeof storeAppointmentSafely>>
      | null = null;

    try {
      storageResult = await storeAppointmentSafely({
        providerId: provider.id,
        patientName: parsed.data.patientName,
        patientPhone: parsed.data.patientPhone,
        preferredDate: parsed.data.preferredDate || null,
        note: parsed.data.note || null,
        source: "public-whatsapp-form"
      });
    } catch (storageError) {
      // Contact remains available even during a temporary storage incident.
      logServerError("Appointment storage error", storageError);
    }

    if (storageResult?.saved) {
      revalidatePath("/admin/appointments");
      revalidatePath(providerProfilePath);
    }

    const messageText = storageResult?.saved
      ? "حُفظ طلبك في طب نت وجُهزت رسالة واتساب. افتح واتساب لإرسالها إلى العيادة."
      : storageResult?.duplicate
        ? "يوجد طلب مماثل محفوظ حديثاً. جُهزت رسالة واتساب دون إنشاء سجل مكرر."
        : storageResult?.rateLimited
          ? "وصلت عدة طلبات من هذا الرقم خلال مدة قصيرة، لذلك لم نُنشئ سجلاً جديداً. ما زال بإمكانك فتح واتساب والتواصل مباشرة."
          : "تعذر حفظ الطلب داخل طب نت مؤقتاً، لكن جُهزت رسالة واتساب ويمكنك التواصل مباشرة.";

    return {
      ok: true,
      message: messageText,
      saved: Boolean(storageResult?.saved),
      duplicate: Boolean(storageResult?.duplicate),
      rateLimited: Boolean(storageResult?.rateLimited),
      appointmentId: storageResult?.appointmentId ?? null,
      whatsappUrl,
      whatsappMessage: message
    };
  } catch (error) {
    logServerError("Public appointment action error", error);

    return {
      ok: false,
      message:
        error instanceof AppointmentRequestError
          ? error.message
          : "تعذر تجهيز طلب الموعد. يُرجى المحاولة مجدداً."
    };
  }
}
