import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { ProviderForm } from "@/components/admin/provider-form";
import { createProvider } from "@/lib/actions/admin";
import { getAdminLocationOptions } from "@/lib/admin-form-options";

export default async function NewDentistPage() {
  const { governorates, areas } = await getAdminLocationOptions();

  const hasGovernorates = governorates.length > 0;
  const hasAreas = areas.length > 0;
  const canCreate = hasGovernorates && hasAreas;

  return (
    <>
      <AdminFormHeader
        title="إضافة طبيب أسنان"
        backHref="/admin/dentists"
        backLabel="العودة إلى أطباء الأسنان"
      />

      <div className="space-y-4">
        <LocationRequirement
          hasGovernorates={hasGovernorates}
          hasAreas={hasAreas}
        />

        {canCreate ? (
          <ProviderForm
            mode="create"
            fixedType="DENTIST"
            action={createProvider}
            governorates={governorates}
            areas={areas}
            specialties={[]}
          />
        ) : null}
      </div>
    </>
  );
}
