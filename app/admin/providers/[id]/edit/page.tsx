import { notFound } from "next/navigation";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { ProviderForm } from "@/components/admin/provider-form";
import { Button } from "@/components/ui/button";
import {
  deleteProvider,
  updateProvider
} from "@/lib/actions/admin";
import {
  getAdminLocationOptions,
  getAdminSpecialtyOptions
} from "@/lib/admin-form-options";
import { prisma } from "@/lib/prisma";

type EditDoctorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDoctorPage({
  params
}: EditDoctorPageProps) {
  const { id } = await params;

  const [row, locations, specialties] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        id,
        type: "DOCTOR"
      }
    }),
    getAdminLocationOptions(),
    getAdminSpecialtyOptions("DOCTOR")
  ]);

  if (!row) {
    notFound();
  }

  return (
    <>
      <AdminFormHeader
        title={`تعديل ${row.name}`}
        backHref="/admin/providers"
        backLabel="العودة إلى الأطباء"
      />

      <ProviderForm
        mode="edit"
        fixedType="DOCTOR"
        action={updateProvider}
        governorates={locations.governorates}
        areas={locations.areas}
        specialties={specialties}
        row={row}
      />

      <form
        action={deleteProvider}
        className="mt-6 flex justify-end border-t border-borderSoft pt-4"
      >
        <input type="hidden" name="id" value={row.id} />

        <Button type="submit" variant="danger">
          حذف الطبيب أو تعطيله إذا كان مرتبطاً ببيانات
        </Button>
      </form>
    </>
  );
}
