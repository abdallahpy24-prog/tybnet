import { z } from "zod";
import { normalizeInstagram } from "@/lib/instagram";
import { normalizeIraqWhatsapp } from "@/lib/whatsapp";

export const idSchema = z.string().min(1);

export const governorateSchema = z.object({
  name: z.string().trim().min(2, "اسم المحافظة مطلوب"),
  slug: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true)
});

export const areaSchema = z.object({
  governorateId: idSchema,
  name: z.string().trim().min(2, "اسم المنطقة مطلوب"),
  slug: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true)
});

export const specialtySchema = z.object({
  name: z.string().trim().min(2, "اسم الاختصاص مطلوب"),
  slug: z.string().trim().optional(),
  forType: z.enum(["DOCTOR", "DENTIST", "BOTH"]),
  icon: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true)
});

export const providerSchema = z.object({
  type: z.enum(["DOCTOR", "DENTIST"]),
  name: z.string().trim().min(2, "اسم مقدم الخدمة مطلوب"),
  slug: z.string().trim().optional(),
  titlePrefix: z.string().trim().default("د."),
  specialtyId: idSchema,
  governorateId: idSchema,
  areaId: idSchema,
  bio: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  whatsapp: z.string().trim().optional().nullable().transform((value, ctx) => {
    if (!value) return null;
    const normalized = normalizeIraqWhatsapp(value);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم واتساب عراقي غير صحيح" });
      return z.NEVER;
    }
    return normalized;
  }),
  instagramUrl: z.string().trim().optional().nullable().transform((value) => normalizeInstagram(value)),
  imageUrl: z.string().trim().optional().nullable(),
  workingHours: z.string().trim().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0)
});

export const offerSchema = z.object({
  title: z.string().trim().min(2, "عنوان العرض مطلوب"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  discountText: z.string().trim().optional().nullable(),
  startsAt: z.string().trim().optional().nullable(),
  endsAt: z.string().trim().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  providerId: z.string().trim().optional().nullable()
});

export const appointmentSchema = z.object({
  providerId: z.string().trim().optional().nullable(),
  patientName: z.string().trim().min(2, "اسم المريض مطلوب"),
  patientPhone: z.string().trim().min(7, "رقم الهاتف مطلوب"),
  preferredDate: z.string().trim().optional().nullable(),
  note: z.string().trim().optional().nullable()
});

export const servicePlaceSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  slug: z.string().trim().optional(),
  governorateId: idSchema,
  areaId: idSchema,
  address: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  whatsapp: z.string().trim().optional().nullable().transform((value, ctx) => {
    if (!value) return null;
    const normalized = normalizeIraqWhatsapp(value);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم واتساب عراقي غير صحيح" });
      return z.NEVER;
    }
    return normalized;
  }),
  imageUrl: z.string().trim().optional().nullable(),
  workingHours: z.string().trim().optional().nullable(),
  services: z.string().trim().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  isFeatured: z.coerce.boolean().default(false)
});
