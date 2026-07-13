import { notFound } from "next/navigation";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { ProviderForm } from "@/components/admin/provider-form";
import { Button } from "@/components/ui/button";
import {
  deleteProvider,
  updateProvider
} from "@/lib/actions/admin";
import { getAdminLocationOptions } from "@/lib/admin-form-options";
import { prisma } from "@/lib/prisma";

type EditDentistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDentistPage({
  params
}: EditDentistPageProps) {
  const { id } = await params;

  const [row, locations] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        id,
        type: "DENTIST"
      }
    }),
    getAdminLocationOptions()
  ]);

  if (!row) {
    notFound();
  }

  return (
    <>
      <AdminFormHeader
        title={`تعديل ${row.name}`}
        backHref="/admin/dentists"
        backLabel="العودة إلى أطباء الأسنان"
      />

      <ProviderForm
        mode="edit"
        fixedType="DENTIST"
        action={updateProvider}
        governorates={locations.governorates}
        areas={locations.areas}
        specialties={[]}
        row={row}
      />

      <form
        action={deleteProvider}
        className="mt-6 flex justify-end border-t border-borderSoft pt-4"
      >
        <input type="hidden" name="id" value={row.id} />

        <Button type="submit" variant="danger">
          حذف طبيب الأسنان أو تعطيله إذا كان مرتبطاً ببيانات
        </Button>
      </form>
    </>
  );
}
