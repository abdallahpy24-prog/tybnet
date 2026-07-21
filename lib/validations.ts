import { z } from "zod";

import { normalizeInstagram } from "@/lib/instagram";
import { normalizeIraqWhatsapp } from "@/lib/whatsapp";

const MAX_LOCATION_SORT_ORDER = 1_000_000;

export const idSchema = z
  .string()
  .trim()
  .min(1, "المعرف مطلوب")
  .max(191, "المعرف طويل جداً");

function optionalText(
  maxLength: number,
  message = "النص طويل جداً"
) {
  return z
    .string()
    .trim()
    .max(maxLength, message)
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) {
        return null;
      }

      return value;
    });
}

const optionalId = z
  .string()
  .trim()
  .max(191, "المعرف طويل جداً")
  .optional()
  .nullable()
  .transform((value) => value || null);

const optionalSlug = z
  .string()
  .trim()
  .max(120, "الرابط المختصر طويل جداً")
  .regex(
    /^[\p{L}\p{N}_-]*$/u,
    "الرابط المختصر يقبل الأحرف والأرقام والشرطة فقط"
  )
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value;
  });

const optionalDateText = z
  .string()
  .trim()
  .max(40, "قيمة التاريخ طويلة جداً")
  .optional()
  .nullable()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "التاريخ غير صحيح"
      });

      return z.NEVER;
    }

    return value;
  });

const optionalIraqWhatsapp = z
  .string()
  .trim()
  .max(32, "رقم واتساب طويل جداً")
  .optional()
  .nullable()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }

    const normalized = normalizeIraqWhatsapp(value);

    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رقم واتساب عراقي غير صحيح"
      });

      return z.NEVER;
    }

    return normalized;
  });

const optionalInstagramUrl = z
  .string()
  .trim()
  .max(200, "رابط إنستغرام طويل جداً")
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return normalizeInstagram(value);
  });

const optionalMapUrl = z
  .string()
  .trim()
  .max(2048, "رابط الموقع على الخريطة طويل جداً")
  .optional()
  .nullable()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }

    const cleanValue = value.trim();

    try {
      if (/^https?:\/\//i.test(cleanValue)) {
        return new URL(cleanValue).toString();
      }

      if (
        cleanValue.startsWith("www.google.com/maps") ||
        cleanValue.startsWith("google.com/maps") ||
        cleanValue.startsWith("maps.google.com") ||
        cleanValue.startsWith("maps.app.goo.gl") ||
        cleanValue.startsWith("goo.gl/maps") ||
        cleanValue.startsWith("maps.apple.com")
      ) {
        return new URL(`https://${cleanValue}`).toString();
      }

      if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(cleanValue)) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          cleanValue
        )}`;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رابط الموقع على الخريطة غير صحيح"
      });

      return z.NEVER;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رابط الموقع على الخريطة غير صحيح"
      });

      return z.NEVER;
    }
  });

function isValidPhone(value: string) {
  if (!/^[+\d\s()-]+$/.test(value)) {
    return false;
  }

  const digits = value.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
}

const optionalPhone = z
  .string()
  .trim()
  .max(32, "رقم الهاتف طويل جداً")
  .optional()
  .nullable()
  .superRefine((value, ctx) => {
    if (value && !isValidPhone(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رقم الهاتف غير صحيح"
      });
    }
  })
  .transform((value) => value || null);

const requiredPhone = z
  .string()
  .trim()
  .min(7, "رقم الهاتف مطلوب")
  .max(32, "رقم الهاتف طويل جداً")
  .refine(isValidPhone, "رقم الهاتف غير صحيح");

const optionalImageUrl = z
  .string()
  .trim()
  .max(2048, "رابط الصورة طويل جداً")
  .optional()
  .nullable()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }

    if (value.startsWith("/") && !value.startsWith("//")) {
      return value;
    }

    try {
      const url = new URL(value);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Unsupported image URL protocol");
      }

      return url.toString();
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رابط الصورة غير صحيح"
      });

      return z.NEVER;
    }
  });

export const governorateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم المحافظة مطلوب")
    .max(100, "اسم المحافظة طويل جداً"),
  slug: optionalSlug,
  sortOrder: z.coerce
    .number()
    .int("الترتيب يجب أن يكون رقماً صحيحاً")
    .min(0, "الترتيب لا يمكن أن يكون أقل من صفر")
    .max(MAX_LOCATION_SORT_ORDER, "قيمة الترتيب كبيرة جداً")
    .default(0),
  isActive: z.coerce.boolean().default(true)
});

export const areaSchema = z.object({
  governorateId: idSchema,
  name: z
    .string()
    .trim()
    .min(2, "اسم المنطقة مطلوب")
    .max(120, "اسم المنطقة طويل جداً"),
  slug: optionalSlug,
  sortOrder: z.coerce
    .number()
    .int("الترتيب يجب أن يكون رقماً صحيحاً")
    .min(0, "الترتيب لا يمكن أن يكون أقل من صفر")
    .max(MAX_LOCATION_SORT_ORDER, "قيمة الترتيب كبيرة جداً")
    .default(0),
  isActive: z.coerce.boolean().default(true)
});

export const specialtySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الاختصاص مطلوب")
    .max(120, "اسم الاختصاص طويل جداً"),
  slug: optionalSlug,
  forType: z.enum(["DOCTOR", "COSMETIC_DOCTOR"]),
  icon: optionalText(80, "قيمة الأيقونة طويلة جداً"),
  isActive: z.coerce.boolean().default(true)
});

const providerBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم مقدم الخدمة مطلوب")
    .max(160, "اسم مقدم الخدمة طويل جداً"),
  slug: optionalSlug,
  titlePrefix: z
    .string()
    .trim()
    .max(20, "اللقب طويل جداً")
    .default("د."),
  specialtyId: optionalId,
  governorateId: idSchema,
  areaId: idSchema,
  bio: optionalText(3000, "النبذة طويلة جداً"),
  address: optionalText(500, "العنوان طويل جداً"),
  mapurl: optionalMapUrl,
  phone: optionalPhone,
  whatsapp: optionalIraqWhatsapp,
  instagramUrl: optionalInstagramUrl,
  imageUrl: optionalImageUrl,
  imageThumbnailUrl: optionalImageUrl,
  imageOriginalUrl: optionalImageUrl,
  workingHours: optionalText(500, "أوقات العمل طويلة جداً"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false),
  bookingPoints: z.coerce
    .number()
    .int()
    .min(0, "عدد النقاط لا يمكن أن يكون أقل من صفر")
    .max(1_000_000_000, "عدد النقاط كبير جداً")
    .default(0)
});

export const providerSchema = providerBaseSchema
  .extend({
    type: z.enum(["DOCTOR", "DENTIST"])
  })
  .superRefine((value, ctx) => {
    if (value.type === "DOCTOR" && !value.specialtyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialtyId"],
        message: "اختصاص الطبيب مطلوب"
      });
    }
  });

export const cosmeticDoctorSchema = providerBaseSchema
  .extend({
    type: z.literal("COSMETIC_DOCTOR")
  })
  .superRefine((value, ctx) => {
    if (!value.specialtyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialtyId"],
        message: "اختصاص طبيب التجميل مطلوب"
      });
    }
  });

export const offerSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "عنوان العرض مطلوب")
      .max(180, "عنوان العرض طويل جداً"),
    slug: optionalSlug,
    description: optionalText(3000, "وصف العرض طويل جداً"),
    imageUrl: optionalImageUrl,
    discountText: optionalText(120, "نص الخصم طويل جداً"),
    startsAt: optionalDateText,
    endsAt: optionalDateText,
    isActive: z.coerce.boolean().default(true),
    providerId: optionalId
  })
  .superRefine((value, ctx) => {
    if (!value.startsAt || !value.endsAt) {
      return;
    }

    if (new Date(value.endsAt) < new Date(value.startsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية"
      });
    }
  });

export const appointmentSchema = z.object({
  providerId: optionalId,
  patientName: z
    .string()
    .trim()
    .min(2, "اسم المريض مطلوب")
    .max(120, "اسم المريض طويل جداً"),
  patientPhone: requiredPhone,
  preferredDate: optionalText(120, "الموعد المفضل طويل جداً"),
  note: optionalText(1000, "الملاحظة طويلة جداً")
});

export const servicePlaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم مطلوب")
    .max(160, "الاسم طويل جداً"),
  slug: optionalSlug,

  governorateId: idSchema,
  areaId: idSchema,

  bio: optionalText(3000, "النبذة طويلة جداً"),
  services: optionalText(5000, "نص الخدمات طويل جداً"),

  address: optionalText(500, "العنوان طويل جداً"),
  mapurl: optionalMapUrl,

  phone: optionalPhone,
  whatsapp: optionalIraqWhatsapp,

  imageUrl: optionalImageUrl,
  imageThumbnailUrl: optionalImageUrl,
  imageOriginalUrl: optionalImageUrl,
  workingHours: optionalText(500, "أوقات العمل طويلة جداً"),

  status: z.enum(["ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false),
  inquiryCount: z.coerce
    .number()
    .int()
    .min(0, "عدد النقاط لا يمكن أن يكون أقل من صفر")
    .max(1_000_000_000, "عدد النقاط كبير جداً")
    .default(0)
});

export const cosmeticCenterSchema = servicePlaceSchema.extend({
  instagramUrl: optionalInstagramUrl
});
