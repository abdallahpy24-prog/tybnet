import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { createCosmeticCenter } from "@/lib/actions/cosmetic";
import { getAdminLocationOptions } from "@/lib/admin-form-options";

export default async function NewCosmeticCenterPage() {
  const { governorates, areas } = await getAdminLocationOptions();

  const hasGovernorates = governorates.length > 0;
  const hasAreas = areas.length > 0;
  const canCreate = hasGovernorates && hasAreas;

  return (
    <>
      <AdminFormHeader
        title="إضافة مركز تجميل"
        backHref="/admin/cosmetic-centers"
        backLabel="العودة إلى مراكز التجميل"
      />

      <div className="space-y-4">
        <LocationRequirement
          hasGovernorates={hasGovernorates}
          hasAreas={hasAreas}
        />

        {canCreate ? (
          <ServicePlaceForm
            kind="cosmetic-center"
            action={createCosmeticCenter}
            governorates={governorates}
            areas={areas}
            submit="إضافة مركز تجميل"
          />
        ) : null}
      </div>
    </>
  );
}
