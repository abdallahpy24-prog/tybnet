"use server";

import { revalidatePath } from "next/cache";

import { auditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requiredText(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();

  if (!value) {
    throw new Error("البيانات المطلوبة غير مكتملة");
  }

  return value;
}

function revalidateEntityPaths(entityType: string, slug: string) {
  revalidatePath("/admin/information-reports");
  revalidatePath("/api/mobile/home");

  if (entityType === "PROVIDER") {
    revalidatePath(`/providers/${slug}`);
    revalidatePath(`/cosmetic-doctors/${slug}`);
    revalidatePath(`/api/mobile/providers/${slug}`);
    return;
  }

  if (entityType === "PHARMACY") {
    revalidatePath(`/pharmacies/${slug}`);
    revalidatePath(`/api/mobile/pharmacies/${slug}`);
    return;
  }

  if (entityType === "LAB") {
    revalidatePath(`/labs/${slug}`);
    revalidatePath(`/api/mobile/labs/${slug}`);
    return;
  }

  if (entityType === "COSMETIC_CENTER") {
    revalidatePath(`/cosmetic-centers/${slug}`);
    revalidatePath(`/api/mobile/cosmetic-centers/${slug}`);
  }
}

async function setLastVerifiedAt(
  entityType: string,
  entityId: string,
  verifiedAt: Date
) {
  switch (entityType) {
    case "PROVIDER":
      await prisma.provider.update({
        where: { id: entityId },
        data: { lastVerifiedAt: verifiedAt }
      });
      return;
    case "PHARMACY":
      await prisma.pharmacy.update({
        where: { id: entityId },
        data: { lastVerifiedAt: verifiedAt }
      });
      return;
    case "LAB":
      await prisma.lab.update({
        where: { id: entityId },
        data: { lastVerifiedAt: verifiedAt }
      });
      return;
    case "COSMETIC_CENTER":
      await prisma.cosmeticCenter.update({
        where: { id: entityId },
        data: { lastVerifiedAt: verifiedAt }
      });
      return;
    default:
      throw new Error("نوع مقدم الخدمة غير مدعوم");
  }
}

export async function resolveInformationReport(formData: FormData) {
  const session = await requireAdmin();
  const id = requiredText(formData, "id");
  const adminNote = String(formData.get("adminNote") || "").trim();
  const verifiedAt = new Date();

  const before = await prisma.informationReport.findUniqueOrThrow({
    where: { id }
  });

  await setLastVerifiedAt(before.entityType, before.entityId, verifiedAt);

  const report = await prisma.informationReport.update({
    where: { id },
    data: {
      status: "RESOLVED",
      adminNote: adminNote || "تمت مراجعة المعلومات وتصحيحها أو تأكيد صحتها.",
      resolvedAt: verifiedAt
    }
  });

  await auditLog({
    userId: session.user.id,
    action: "resolve-and-verify",
    entity: "InformationReport",
    entityId: id,
    beforeJson: before,
    afterJson: report
  });

  revalidateEntityPaths(report.entityType, report.entitySlug);
}

export async function rejectInformationReport(formData: FormData) {
  const session = await requireAdmin();
  const id = requiredText(formData, "id");
  const adminNote = String(formData.get("adminNote") || "").trim();

  const before = await prisma.informationReport.findUniqueOrThrow({
    where: { id }
  });

  const report = await prisma.informationReport.update({
    where: { id },
    data: {
      status: "REJECTED",
      adminNote: adminNote || "تمت المراجعة ولم يثبت وجود خطأ في المعلومات.",
      resolvedAt: new Date()
    }
  });

  await auditLog({
    userId: session.user.id,
    action: "reject",
    entity: "InformationReport",
    entityId: id,
    beforeJson: before,
    afterJson: report
  });

  revalidatePath("/admin/information-reports");
}
