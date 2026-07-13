import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { createPharmacy } from "@/lib/actions/admin";
import { getAdminLocationOptions } from "@/lib/admin-form-options";

export default async function NewPharmacyPage() {
  const { governorates, areas } = await getAdminLocationOptions();

  const hasGovernorates = governorates.length > 0;
  const hasAreas = areas.length > 0;
  const canCreate = hasGovernorates && hasAreas;

  return (
    <>
      <AdminFormHeader
        title="إضافة صيدلية"
        backHref="/admin/pharmacies"
        backLabel="العودة إلى الصيدليات"
      />

      <div className="space-y-4">
        <LocationRequirement
          hasGovernorates={hasGovernorates}
          hasAreas={hasAreas}
        />

        {canCreate ? (
          <ServicePlaceForm
            kind="pharmacy"
            action={createPharmacy}
            governorates={governorates}
            areas={areas}
            submit="إضافة صيدلية"
          />
        ) : null}
      </div>
    </>
  );
}
