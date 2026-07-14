"use server";

import { revalidatePath } from "next/cache";

import { auditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import {
  cosmeticCenterSchema,
  cosmeticDoctorSchema
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
  return (
    formData.get(name) === "on" ||
    formData.get(name) === "true"
  );
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

async function ensureCosmeticSpecialty(
  specialtyId: string | null | undefined
) {
  if (!specialtyId) {
    throw new Error("اختصاص طبيب التجميل مطلوب");
  }

  const specialty = await prisma.specialty.findUnique({
    where: {
      id: specialtyId
    }
  });

  if (!specialty || !specialty.isActive) {
    throw new Error("الاختصاص غير موجود أو غير مفعل");
  }

  if (specialty.forType !== "COSMETIC_DOCTOR") {
    throw new Error(
      "الاختصاص المختار ليس من اختصاصات أطباء التجميل"
    );
  }
}

async function uniqueProviderSlug(
  name: string,
  provided?: string | null,
  excludeId?: string
) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);

    const exists = await prisma.provider.findUnique({
      where: {
        slug
      },
      select: {
        id: true
      }
    });

    if (!exists || exists.id === excludeId) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

async function uniqueCosmeticCenterSlug(
  name: string,
  provided?: string | null,
  excludeId?: string
) {
  const base = provided?.trim() || name;

  for (let index = 0; index < 50; index++) {
    const slug = uniqueSlug(base, index || undefined);

    const exists = await prisma.cosmeticCenter.findUnique({
      where: {
        slug
      },
      select: {
        id: true
      }
    });

    if (!exists || exists.id === excludeId) {
      return slug;
    }
  }

  return uniqueSlug(base, Date.now());
}

function revalidateCosmeticDoctorPaths(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cosmetic-doctors");
  revalidatePath("/beauty");
  revalidatePath("/cosmetic-doctors");
  revalidatePath("/api/mobile/home");
  revalidatePath("/api/mobile/cosmetic-doctors");

  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/cosmetic-doctors/${slug}`);
    revalidatePath(`/providers/${slug}`);
    revalidatePath(`/api/mobile/cosmetic-doctors/${slug}`);
  }
}

function revalidateCosmeticCenterPaths(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cosmetic-centers");
  revalidatePath("/beauty");
  revalidatePath("/cosmetic-centers");
  revalidatePath("/api/mobile/home");
  revalidatePath("/api/mobile/cosmetic-centers");

  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/cosmetic-centers/${slug}`);
    revalidatePath(`/api/mobile/cosmetic-centers/${slug}`);
  }
}

export async function createCosmeticDoctor(
  formData: FormData
) {
  const userId = await currentUserId();

  const parsed = cosmeticDoctorSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(
    parsed.areaId,
    parsed.governorateId
  );

  await ensureCosmeticSpecialty(parsed.specialtyId);

  const row = await prisma.provider.create({
    data: {
      ...parsed,
      type: "COSMETIC_DOCTOR",
      slug: await uniqueProviderSlug(
        parsed.name,
        parsed.slug
      ),
      specialtyId: parsed.specialtyId,
      bio: parsed.bio || null,
      address: parsed.address || null,
      mapurl: parsed.mapurl || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      imageThumbnailUrl: parsed.imageThumbnailUrl || null,
      imageOriginalUrl: parsed.imageOriginalUrl || null,
      workingHours: parsed.workingHours || null
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "CosmeticDoctor",
    entityId: row.id,
    afterJson: row
  });

  revalidateCosmeticDoctorPaths([row.slug]);
}

export async function updateCosmeticDoctor(
  formData: FormData
) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.provider.findUniqueOrThrow({
    where: {
      id
    }
  });

  if (before.type !== "COSMETIC_DOCTOR") {
    throw new Error("السجل المحدد ليس طبيب تجميل");
  }

  const raw = formObject(formData);

  if (!("bookingPoints" in raw)) {
    raw.bookingPoints = String(before.bookingPoints);
  }

  const parsed = cosmeticDoctorSchema.parse({
    ...raw,
    type: "COSMETIC_DOCTOR",
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(
    parsed.areaId,
    parsed.governorateId
  );

  await ensureCosmeticSpecialty(parsed.specialtyId);

  const nextSlug = parsed.slug?.trim()
    ? await uniqueProviderSlug(
        parsed.name,
        parsed.slug,
        id
      )
    : before.slug;

  const row = await prisma.provider.update({
    where: {
      id
    },
    data: {
      ...parsed,
      type: "COSMETIC_DOCTOR",
      slug: nextSlug,
      specialtyId: parsed.specialtyId,
      bio: parsed.bio || null,
      address: parsed.address || null,
      mapurl: parsed.mapurl || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      imageThumbnailUrl: parsed.imageThumbnailUrl || null,
      imageOriginalUrl: parsed.imageOriginalUrl || null,
      workingHours: parsed.workingHours || null
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "CosmeticDoctor",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidateCosmeticDoctorPaths([
    before.slug,
    row.slug
  ]);
}

export async function deleteCosmeticDoctor(
  formData: FormData
) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before = await prisma.provider.findUniqueOrThrow({
    where: {
      id
    }
  });

  if (before.type !== "COSMETIC_DOCTOR") {
    throw new Error("السجل المحدد ليس طبيب تجميل");
  }

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
      entity: "CosmeticDoctor",
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
      entity: "CosmeticDoctor",
      entityId: id,
      beforeJson: before
    });
  }

  revalidateCosmeticDoctorPaths([before.slug]);
}

export async function createCosmeticCenter(
  formData: FormData
) {
  const userId = await currentUserId();

  const parsed = cosmeticCenterSchema.parse({
    ...formObject(formData),
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(
    parsed.areaId,
    parsed.governorateId
  );

  const row = await prisma.cosmeticCenter.create({
    data: {
      name: parsed.name,
      slug: await uniqueCosmeticCenterSlug(
        parsed.name,
        parsed.slug
      ),
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      bio: parsed.bio || null,
      services: parsed.services || null,
      address: parsed.address || null,
      mapurl: parsed.mapurl || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      imageThumbnailUrl: parsed.imageThumbnailUrl || null,
      imageOriginalUrl: parsed.imageOriginalUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured,
      inquiryCount: parsed.inquiryCount
    }
  });

  await auditLog({
    userId,
    action: "create",
    entity: "CosmeticCenter",
    entityId: row.id,
    afterJson: row
  });

  revalidateCosmeticCenterPaths([row.slug]);
}

export async function updateCosmeticCenter(
  formData: FormData
) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before =
    await prisma.cosmeticCenter.findUniqueOrThrow({
      where: {
        id
      }
    });

  const raw = formObject(formData);

  if (!("inquiryCount" in raw)) {
    raw.inquiryCount = String(before.inquiryCount);
  }

  const parsed = cosmeticCenterSchema.parse({
    ...raw,
    isFeatured: boolFromForm(formData, "isFeatured")
  });

  await ensureAreaBelongsToGovernorate(
    parsed.areaId,
    parsed.governorateId
  );

  const nextSlug = parsed.slug?.trim()
    ? await uniqueCosmeticCenterSlug(
        parsed.name,
        parsed.slug,
        id
      )
    : before.slug;

  const row = await prisma.cosmeticCenter.update({
    where: {
      id
    },
    data: {
      name: parsed.name,
      slug: nextSlug,
      governorateId: parsed.governorateId,
      areaId: parsed.areaId,
      bio: parsed.bio || null,
      services: parsed.services || null,
      address: parsed.address || null,
      mapurl: parsed.mapurl || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      instagramUrl: parsed.instagramUrl || null,
      imageUrl: parsed.imageUrl || null,
      imageThumbnailUrl: parsed.imageThumbnailUrl || null,
      imageOriginalUrl: parsed.imageOriginalUrl || null,
      workingHours: parsed.workingHours || null,
      status: parsed.status,
      isFeatured: parsed.isFeatured,
      inquiryCount: parsed.inquiryCount
    }
  });

  await auditLog({
    userId,
    action: "update",
    entity: "CosmeticCenter",
    entityId: id,
    beforeJson: before,
    afterJson: row
  });

  revalidateCosmeticCenterPaths([
    before.slug,
    row.slug
  ]);
}

export async function deleteCosmeticCenter(
  formData: FormData
) {
  const userId = await currentUserId();
  const id = requiredId(formData);

  const before =
    await prisma.cosmeticCenter.findUniqueOrThrow({
      where: {
        id
      }
    });

  await prisma.cosmeticCenter.delete({
    where: {
      id
    }
  });

  await auditLog({
    userId,
    action: "delete",
    entity: "CosmeticCenter",
    entityId: id,
    beforeJson: before
  });

  revalidateCosmeticCenterPaths([before.slug]);
}
