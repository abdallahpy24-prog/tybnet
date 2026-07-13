import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { createLab } from "@/lib/actions/admin";
import { getAdminLocationOptions } from "@/lib/admin-form-options";

export default async function NewLabPage() {
  const { governorates, areas } = await getAdminLocationOptions();

  const hasGovernorates = governorates.length > 0;
  const hasAreas = areas.length > 0;
  const canCreate = hasGovernorates && hasAreas;

  return (
    <>
      <AdminFormHeader
        title="إضافة مختبر"
        backHref="/admin/labs"
        backLabel="العودة إلى المختبرات"
      />

      <div className="space-y-4">
        <LocationRequirement
          hasGovernorates={hasGovernorates}
          hasAreas={hasAreas}
        />

        {canCreate ? (
          <ServicePlaceForm
            kind="lab"
            action={createLab}
            governorates={governorates}
            areas={areas}
            submit="إضافة مختبر"
          />
        ) : null}
      </div>
    </>
  );
}
