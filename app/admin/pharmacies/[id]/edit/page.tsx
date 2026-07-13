import { notFound } from "next/navigation";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { Button } from "@/components/ui/button";
import {
  deletePharmacy,
  updatePharmacy
} from "@/lib/actions/admin";
import { getAdminLocationOptions } from "@/lib/admin-form-options";
import { prisma } from "@/lib/prisma";

type EditPharmacyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPharmacyPage({
  params
}: EditPharmacyPageProps) {
  const { id } = await params;

  const [row, locations] = await Promise.all([
    prisma.pharmacy.findUnique({
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
        backHref="/admin/pharmacies"
        backLabel="العودة إلى الصيدليات"
      />

      <ServicePlaceForm
        kind="pharmacy"
        action={updatePharmacy}
        governorates={locations.governorates}
        areas={locations.areas}
        submit="حفظ التعديل"
        row={row}
      />

      <form
        action={deletePharmacy}
        className="mt-6 flex justify-end border-t border-borderSoft pt-4"
      >
        <input type="hidden" name="id" value={row.id} />

        <Button type="submit" variant="danger">
          حذف الصيدلية
        </Button>
      </form>
    </>
  );
}
