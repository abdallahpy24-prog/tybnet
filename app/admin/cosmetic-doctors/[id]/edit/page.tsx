import { notFound } from "next/navigation";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { ProviderForm } from "@/components/admin/provider-form";
import { Button } from "@/components/ui/button";
import {
  deleteCosmeticDoctor,
  updateCosmeticDoctor
} from "@/lib/actions/cosmetic";
import {
  getAdminLocationOptions,
  getAdminSpecialtyOptions
} from "@/lib/admin-form-options";
import { prisma } from "@/lib/prisma";

type EditCosmeticDoctorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCosmeticDoctorPage({
  params
}: EditCosmeticDoctorPageProps) {
  const { id } = await params;

  const [row, locations, specialties] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        id,
        type: "COSMETIC_DOCTOR"
      }
    }),
    getAdminLocationOptions(),
    getAdminSpecialtyOptions("COSMETIC_DOCTOR")
  ]);

  if (!row) {
    notFound();
  }

  return (
    <>
      <AdminFormHeader
        title={`تعديل ${row.name}`}
        backHref="/admin/cosmetic-doctors"
        backLabel="العودة إلى أطباء التجميل"
      />

      <ProviderForm
        mode="edit"
        fixedType="COSMETIC_DOCTOR"
        category="COSMETIC"
        action={updateCosmeticDoctor}
        governorates={locations.governorates}
        areas={locations.areas}
        specialties={specialties}
        row={row}
      />

      <form
        action={deleteCosmeticDoctor}
        className="mt-6 flex justify-end border-t border-borderSoft pt-4"
      >
        <input type="hidden" name="id" value={row.id} />

        <Button type="submit" variant="danger">
          حذف طبيب التجميل أو تعطيله إذا كان مرتبطاً ببيانات
        </Button>
      </form>
    </>
  );
}
