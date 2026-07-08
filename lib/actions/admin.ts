"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/permissions";
import { uniqueSlug } from "@/lib/slug";
import {
  areaSchema,
  governorateSchema,
  offerSchema,
  providerSchema,
  servicePlaceSchema,
  specialtySchema
} from "@/lib/validations";

function requiredId(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("المعرّف مطلوب");
  }

  return id.trim();
}

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function boolFromForm(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function textFromForm(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function normalizedEmailFromForm(formData: FormData, name: string) {
  return textFromForm(formData, name).toLowerCase();
}

function normalizedUsernameFromForm(formData: FormData, name: string) {
  return textFromForm(formData, name).toLowerCase();
}

async function currentUserId() {
  const session = await requireAdmin();

  return session.user.id;
}

async function ensureAreaBelongsToGovernorate(
  areaId: string,
  governorateId: string
) {
  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      governorateId
    }
  });

  if (!area) {
    throw new Error("المنطقة المختارة لا تتبع المحافظة المحددة");
  }
}

async function ensureSpecialtyMatchesProviderType(
  specialtyId: string | null | undefined,
  type: "DOCTOR" | "DENTIST"
) {
  if (!specialtyId) {
    throw new Error("الاختصاص مطلوب");
  }

  const specialty = await prisma.specialty.findUnique({
    where: {
      id: specialtyId
    }
  });

  if (!specialty || !specialty.isActive) {
    throw new Error("الاختصاص غير موجود أو غير مفعل");
  }

  const isValid = specialty.forType === "BOTH" || specialty.forType === type;

  if (!isValid) {
    throw new Error("الاختصاص المختار لا يناسب نوع مقدم الخدمة");
  }
}

async function uniqueGovernorateSlug(name: string, provided?: string | null) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.governorate.findUnique({
      where: {
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueAreaSlug(
  name: string,
  governorateId: string,
  provided?: string | null
) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.area.findFirst({
      where: {
        governorateId,
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueSpecialtySlug(
  name: string,
  forType: "DOCTOR" | "DENTIST" | "BOTH",
  provided?: string | null
) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.specialty.findFirst({
      where: {
        forType,
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueProviderSlug(name: string, provided?: string | null) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.provider.findUnique({
      where: {
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueOfferSlug(title: string, provided?: string | null) {
  const base = provided?.trim() || title;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.offer.findUnique({
      where: {
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniquePharmacySlug(name: string, provided?: string | null) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.pharmacy.findUnique({
      where: {
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueLabSlug(name: string, provided?: string | null) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);
    const exists = await prisma.lab.findUnique({
      where: {
        slug
      }
    });

    if (!exists) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

export async function createGovernorate(formData: FormData) {
  const userId = await currentUserId();

  const parsed = governorateSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.governorate.create({
    data: {
      name: parsed.name,
      slug: await uniqueGovernorateSlug(parsed.name, parsed.slug),
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Governorate",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/governorates");
}

export async function updateGovernorate(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.governorate.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = governorateSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.governorate.update({
    where: {
      id
    },
    data: {
      name: parsed.name,
      slug: parsed.slug?.trim() || before.slug,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Governorate",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/governorates");
}

export async function deleteGovernorate(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.governorate.findUniqueOrThrow({
    where: {
      id
    }
  });

  const linked = await Promise.all([
    prisma.area.count({
      where: {
        governorateId: id
      }
    }),
    prisma.provider.count({
      where: {
        governorateId: id
      }
    }),
    prisma.pharmacy.count({
      where: {
        governorateId: id
      }
    }),
    prisma.lab.count({
      where: {
        governorateId: id
      }
    })
  ]);

  if (linked.some(Boolean)) {
    const row = await prisma.governorate.update({
      where: {
        id
      },
      data: {
        isActive: false
      }
    });

    await auditLog({
      userId,
      action: "disable-linked",
      entity: "Governorate",
      entityId: id,
      beforeJson: before,
      afterJson: row
    });
  } else {
    await prisma.governorate.delete({
      where: {
        id
      }
    });

    await auditLog({
      userId,
      action: "delete",
      entity: "Governorate",
      entityId: id,
      beforeJson: before
    });
  }

  revalidatePath("/admin/governorates");
}

export async function createArea(formData: FormData) {
  const userId = await currentUserId();

  const parsed = areaSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.area.create({
    data: {
      governorateId: parsed.governorateId,
      name: parsed.name,
      slug: await uniqueAreaSlug(
        parsed.name,
        parsed.governorateId,
        parsed.slug
      ),
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Area",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/areas");
}

export async function updateArea(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.area.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = areaSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.area.update({
    where: {
      id
    },
    data: {
      governorateId: parsed.governorateId,
      name: parsed.name,
      slug: parsed.slug?.trim() || before.slug,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Area",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/areas");
}

export async function deleteArea(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.area.findUniqueOrThrow({
    where: {
      id
    }
  });

  const linked = await Promise.all([
    prisma.provider.count({
      where: {
        areaId: id
      }
    }),
    prisma.pharmacy.count({
      where: {
        areaId: id
      }
    }),
    prisma.lab.count({
      where: {
        areaId: id
      }
    })
  ]);

  if (linked.some(Boolean)) {
    const row = await prisma.area.update({
      where: {
        id
      },
      data: {
        isActive: false
      }
    });

    await auditLog({
      userId,
      action: "disable-linked",
      entity: "Area",
      entityId: id,
      beforeJson: before,
      afterJson: row
    });
  } else {
    await prisma.area.delete({
      where: {
        id
      }
    });

    await auditLog({
      userId,
      action: "delete",
      entity: "Area",
      entityId: id,
      beforeJson: before
    });
  }

  revalidatePath("/admin/areas");
}

export async function createSpecialty(formData: FormData) {
  const userId = await currentUserId();

  const parsed = specialtySchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.specialty.create({
    data: {
      name: parsed.name,
      slug: await uniqueSpecialtySlug(
        parsed.name,
        parsed.forType,
        parsed.slug
      ),
      forType: parsed.forType,
      icon: parsed.icon || null,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Specialty",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/specialties");
}

export async function updateSpecialty(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.specialty.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = specialtySchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.specialty.update({
    where: {
      id
    },
    data: {
      name: parsed.name,
      slug: parsed.slug?.trim() || before.slug,
      forType: parsed.forType,
      icon: parsed.icon || null,
      isActive: parsed.isActive
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Specialty",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/specialties");
}

export async function deleteSpecialty(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.specialty.findUniqueOrThrow({
    where: {
      id
    }
  });

  const linked = await prisma.provider.count({
    where: {
      specialtyId: id
    }
  });

  if (linked) {
    const row = await prisma.specialty.update({
      where: {
        id
      },
      data: {
        isActive: false
      }
    });

    await auditLog({
      userId,
      action: "disable-linked",
      entity: "Specialty",
      entityId: id,
      beforeJson: before,
      afterJson: row
    });
  } else {
    await prisma.specialty.delete({
      where: {
        id
      }
    });

    await auditLog({
      userId,
      action: "delete",
      entity: "Specialty",
      entityId: id,
      beforeJson: before
    });
  }

  revalidatePath("/admin/specialties");
}

export async function createProvider(formData: FormData) {
  const userId = await currentUserId();

  const parsed = providerSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);
  await ensureSpecialtyMatchesProviderType(parsed.specialtyId, parsed.type);

  const row = await prisma.provider.create({
    data: {
      ...parsed,
      slug: await uniqueProviderSlug(parsed.name, parsed.slug),
      specialtyId: parsed.specialtyId || null,
      bio: parsed.bio || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Provider",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/providers");
  revalidatePath("/admin");
  revalidatePath("/doctors");
  revalidatePath("/dentists");
}

export async function updateProvider(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.provider.findUniqueOrThrow({
    where: {
      id
    }
  });

  const raw = formObject(formData);

  if (!("bookingPoints" in raw)) {
    raw.bookingPoints = String(before.bookingPoints);
  }

  const parsed = providerSchema.parse({
    ...raw,
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);
  await ensureSpecialtyMatchesProviderType(parsed.specialtyId, parsed.type);

  const row = await prisma.provider.update({
    where: {
      id
    },
    data: {
      ...parsed,
      slug: parsed.slug?.trim() || before.slug,
      specialtyId: parsed.specialtyId || null,
      bio: parsed.bio || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Provider",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/providers");
  revalidatePath("/admin");
  revalidatePath(`/providers/${row.slug}`);
  revalidatePath("/doctors");
  revalidatePath("/dentists");
}

export async function deleteProvider(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.provider.findUniqueOrThrow({
    where: {
      id
    }
  });

  const linked = await Promise.all([
    prisma.offer.count({
      where: {
        providerId: id
      }
    }),
    prisma.appointment.count({
      where: {
        providerId: id
      }
    })
  ]);

  if (linked.some(Boolean)) {
    const row = await prisma.provider.update({
      where: {
        id
      },
      data: {
        status: "INACTIVE"
      }
    });

    await auditLog({
      userId,
      action: "disable-linked",
      entity: "Provider",
      entityId: id,
      beforeJson: before,
      afterJson: row
    });
  } else {
    await prisma.provider.delete({
      where: {
        id
      }
    });

    await auditLog({
      userId,
      action: "delete",
      entity: "Provider",
      entityId: id,
      beforeJson: before
    });
  }

  revalidatePath("/admin/providers");
  revalidatePath("/admin");
  revalidatePath("/doctors");
  revalidatePath("/dentists");
}

export async function createOffer(formData: FormData) {
  const userId = await currentUserId();

  const parsed = offerSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.offer.create({
    data: {
      title: parsed.title,
      slug: await uniqueOfferSlug(parsed.title, parsed.slug),
      description: parsed.description || null,
      imageUrl: parsed.imageUrl || null,
      discountText: parsed.discountText || null,
      startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
      endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
      isActive: parsed.isActive,
      providerId: parsed.providerId || null
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Offer",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/offers");
  revalidatePath("/offers");
}

export async function updateOffer(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.offer.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = offerSchema.parse({
    ...formObject(formData),
    isActive: boolFromForm(formData, "isActive")
  });

  const row = await prisma.offer.update({
    where: {
      id
    },
    data: {
      title: parsed.title,
      slug: parsed.slug?.trim() || before.slug,
      description: parsed.description || null,
      imageUrl: parsed.imageUrl || null,
      discountText: parsed.discountText || null,
      startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
      endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
      isActive: parsed.isActive,
      providerId: parsed.providerId || null
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Offer",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/offers");
  revalidatePath("/offers");
}

export async function deleteOffer(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.offer.findUniqueOrThrow({
    where: {
      id
    }
  });

  await prisma.offer.delete({
    where: {
      id
    }
  });

  await auditLog({
    userId,
    action: "delete",
    entity: "Offer",
    entityId: id,
    beforeJson: before
  });

  revalidatePath("/admin/offers");
  revalidatePath("/offers");
}

export async function createPharmacy(formData: FormData) {
  const userId = await currentUserId();

  const parsed = servicePlaceSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);

  const row = await prisma.pharmacy.create({
    data: {
      name: parsed.name,
      slug: await uniquePharmacySlug(parsed.name, parsed.slug),
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Pharmacy",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/pharmacies");
}

export async function updatePharmacy(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.pharmacy.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = servicePlaceSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);

  const row = await prisma.pharmacy.update({
    where: {
      id
    },
    data: {
      name: parsed.name,
      slug: parsed.slug?.trim() || before.slug,
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Pharmacy",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/pharmacies");
}

export async function deletePharmacy(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.pharmacy.findUniqueOrThrow({
    where: {
      id
    }
  });

  await prisma.pharmacy.delete({
    where: {
      id
    }
  });

  await auditLog({
    userId,
    action: "delete",
    entity: "Pharmacy",
    entityId: id,
    beforeJson: before
  });

  revalidatePath("/admin/pharmacies");
  revalidatePath("/pharmacies");
}

export async function createLab(formData: FormData) {
  const userId = await currentUserId();

  const parsed = servicePlaceSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);

  const row = await prisma.lab.create({
    data: {
      name: parsed.name,
      slug: await uniqueLabSlug(parsed.name, parsed.slug),
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      services: parsed.services || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "Lab",
    entityId: row.id,
    afterJson: row
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
}

export async function updateLab(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.lab.findUniqueOrThrow({
    where: {
      id
    }
  });

  const parsed = servicePlaceSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(parsed.areaId, parsed.governorateId);

  const row = await prisma.lab.update({
    where: {
      id
    },
    data: {
      name: parsed.name,
      slug: parsed.slug?.trim() || before.slug,
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      services: parsed.services || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      imageUrl: parsed.imageUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "Lab",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
}

export async function deleteLab(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.lab.findUniqueOrThrow({
    where: {
      id
    }
  });

  await prisma.lab.delete({
    where: {
      id
    }
  });

  await auditLog({
    userId,
    action: "delete",
    entity: "Lab",
    entityId: id,
    beforeJson: before
  });

  revalidatePath("/admin/labs");
  revalidatePath("/labs");
}

export async function updateAppointmentStatus(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);
  const status = String(formData.get("status") ?? "");

  const allowedStatuses = new Set<string>(Object.values(AppointmentStatus));

  if (!allowedStatuses.has(status)) {
    throw new Error("حالة الموعد غير صحيحة");
  }

  const before = await prisma.appointment.findUniqueOrThrow({
    where: {
      id
    }
  });

  const row = await prisma.appointment.update({
    where: {
      id
    },
    data: {
      status: status as AppointmentStatus
    }
  });

  await auditLog({
    userId,
    action: "update-status",
    entity: "Appointment",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidatePath("/admin/appointments");
}
export async function deleteAppointment(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.appointment.findUniqueOrThrow({
    where: {
      id
    }
  });

  await prisma.appointment.delete({
    where: {
      id
    }
  });

  await auditLog({
    userId,
    action: "delete",
    entity: "Appointment",
    entityId: id,
    beforeJson: before
  });

  revalidatePath("/admin/appointments");
}

export async function deleteAllAppointments() {
  const userId = await currentUserId();

  const count = await prisma.appointment.count();

  await prisma.appointment.deleteMany();

  await auditLog({
    userId,
    action: "delete-all",
    entity: "Appointment",
    afterJson: {
      deletedCount: count
    }
  });

  revalidatePath("/admin/appointments");
}

export async function updateSettings(formData: FormData) {
  const userId = await currentUserId();

  const allowed = [
    "siteNameAr",
    "siteNameEn",
    "heroTitle",
    "heroDescription",
    "supportWhatsapp",
    "facebookUrl",
    "instagramUrl",
    "logoUrl"
  ];

  for (const key of allowed) {
    const value = formData.get(key);

    await prisma.setting.upsert({
      where: {
        key
      },
      update: {
        value: typeof value === "string" ? value : null
      },
      create: {
        key,
        value: typeof value === "string" ? value : null
      }
    });
  }

  await auditLog({
    userId,
    action: "update",
    entity: "Setting",
    afterJson: allowed
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function createUser(formData: FormData) {
  const userId = await currentUserId();

  const name = textFromForm(formData, "name");
  const email = normalizedEmailFromForm(formData, "email");
  const username = normalizedUsernameFromForm(formData, "username");
  const password = String(formData.get("password") ?? "");
  const role =
    String(formData.get("role") ?? Role.EDITOR) === Role.ADMIN
      ? Role.ADMIN
      : Role.EDITOR;

  if (!name || !email || !username || password.length < 8) {
    throw new Error(
      "الاسم والبريد واسم المستخدم وكلمة مرور 8 أحرف مطلوبة"
    );
  }

  const row = await prisma.user.create({
    data: {
      name,
      email,
      username,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      isActive: true
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "User",
    entityId: row.id,
    afterJson: {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role
    }
  });

  revalidatePath("/admin/users");
}

export async function updateUser(formData: FormData) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });

  const name = textFromForm(formData, "name");
  const email = normalizedEmailFromForm(formData, "email");
  const username = normalizedUsernameFromForm(formData, "username");
  const role =
    String(formData.get("role") ?? Role.EDITOR) === Role.ADMIN
      ? Role.ADMIN
      : Role.EDITOR;
  const isActive = boolFromForm(formData, "isActive");

  if (!name || !email || !username) {
    throw new Error("الاسم والبريد واسم المستخدم مطلوبة");
  }

  const activeAdmins = await prisma.user.count({
    where: {
      role: Role.ADMIN,
      isActive: true
    }
  });

  if (
    before.role === Role.ADMIN &&
    before.isActive &&
    (!isActive || role !== Role.ADMIN) &&
    activeAdmins <= 1
  ) {
    throw new Error("لا يمكن تعطيل أو تغيير آخر أدمن نشط");
  }

  const data: {
    name: string;
    email: string;
    username: string;
    role: Role;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name,
    email,
    username,
    role,
    isActive
  };

  const password = String(formData.get("password") ?? "");

  if (password) {
    if (password.length < 8) {
      throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }

    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const row = await prisma.user.update({
    where: {
      id
    },
    data
  });

  await auditLog({
    userId,
    action: "update",
    entity: "User",
    entityId: id,
    beforeJson: {
      id: before.id,
      email: before.email,
      role: before.role,
      isActive: before.isActive
    },
    afterJson: {
      id: row.id,
      email: row.email,
      role: row.role,
      isActive: row.isActive
    }
  });

  revalidatePath("/admin/users");
}