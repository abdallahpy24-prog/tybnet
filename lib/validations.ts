import { z } from "zod";

import { normalizeInstagram } from "@/lib/instagram";
import { normalizeIraqWhatsapp } from "@/lib/whatsapp";

export const idSchema = z.string().trim().min(1);

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const optionalSlug = z
  .string()
  .trim()
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
        message: "التاريخ غير صحيح",
      });

      return z.NEVER;
    }

    return value;
  });

const optionalIraqWhatsapp = z
  .string()
  .trim()
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
        message: "رقم واتساب عراقي غير صحيح",
      });

      return z.NEVER;
    }

    return normalized;
  });

const optionalInstagramUrl = z
  .string()
  .trim()
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
        message: "رابط اللوكيشن غير صحيح",
      });

      return z.NEVER;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رابط اللوكيشن غير صحيح",
      });

      return z.NEVER;
    }
  });

export const governorateSchema = z.object({
  name: z.string().trim().min(2, "اسم المحافظة مطلوب"),
  slug: optionalSlug,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const areaSchema = z.object({
  governorateId: idSchema,
  name: z.string().trim().min(2, "اسم المنطقة مطلوب"),
  slug: optionalSlug,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const specialtySchema = z.object({
  name: z.string().trim().min(2, "اسم الاختصاص مطلوب"),
  slug: optionalSlug,
  forType: z.enum(["DOCTOR", "DENTIST", "BOTH"]),
  icon: optionalText,
  isActive: z.coerce.boolean().default(true),
});

export const providerSchema = z.object({
  type: z.enum(["DOCTOR", "DENTIST"]),
  name: z.string().trim().min(2, "اسم مقدم الخدمة مطلوب"),
  slug: optionalSlug,
  titlePrefix: z.string().trim().default("د."),
  specialtyId: idSchema,
  governorateId: idSchema,
  areaId: idSchema,
  bio: optionalText,
  address: optionalText,
  mapurl: optionalMapUrl,
  phone: optionalText,
  whatsapp: optionalIraqWhatsapp,
  instagramUrl: optionalInstagramUrl,
  imageUrl: optionalText,
  workingHours: optionalText,
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  bookingPoints: z.coerce
    .number()
    .int()
    .min(0, "عدد النقاط لا يمكن أن يكون أقل من صفر")
    .default(0),
});

export const offerSchema = z.object({
  title: z.string().trim().min(2, "عنوان العرض مطلوب"),
  slug: optionalSlug,
  description: optionalText,
  imageUrl: optionalText,
  discountText: optionalText,
  startsAt: optionalDateText,
  endsAt: optionalDateText,
  isActive: z.coerce.boolean().default(true),
  providerId: optionalText,
});

export const appointmentSchema = z.object({
  providerId: optionalText,
  patientName: z.string().trim().min(2, "اسم المريض مطلوب"),
  patientPhone: z.string().trim().min(7, "رقم الهاتف مطلوب"),
  preferredDate: optionalText,
  note: optionalText,
});

export const servicePlaceSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  slug: optionalSlug,

  governorateId: idSchema,
  areaId: idSchema,

  bio: optionalText,
  services: optionalText,

  address: optionalText,
  mapurl: optionalMapUrl,

  phone: optionalText,
  whatsapp: optionalIraqWhatsapp,

  imageUrl: optionalText,
  workingHours: optionalText,

  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});