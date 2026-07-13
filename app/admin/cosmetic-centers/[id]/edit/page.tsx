import { notFound } from "next/navigation";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { Button } from "@/components/ui/button";
import {
  deleteCosmeticCenter,
  updateCosmeticCenter
} from "@/lib/actions/cosmetic";
import { getAdminLocationOptions } from "@/lib/admin-form-options";
import { prisma } from "@/lib/prisma";

type EditCosmeticCenterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCosmeticCenterPage({
  params
}: EditCosmeticCenterPageProps) {
  const { id } = await params;

  const [row, locations] = await Promise.all([
    prisma.cosmeticCenter.findUnique({
      where: {
        id
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
        backHref="/admin/cosmetic-centers"
        backLabel="العودة إلى مراكز التجميل"
      />

      <ServicePlaceForm
        kind="cosmetic-center"
        action={updateCosmeticCenter}
        governorates={locations.governorates}
        areas={locations.areas}
        submit="حفظ التعديل"
        row={row}
      />

      <form
        action={deleteCosmeticCenter}
        className="mt-6 flex justify-end border-t border-borderSoft pt-4"
      >
        <input type="hidden" name="id" value={row.id} />

        <Button type="submit" variant="danger">
          حذف مركز التجميل
        </Button>
      </form>
    </>
  );
}
