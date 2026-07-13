import Link from "next/link";

import { AdminFormHeader } from "@/components/admin/admin-form-header";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { ProviderForm } from "@/components/admin/provider-form";
import { createCosmeticDoctor } from "@/lib/actions/cosmetic";
import {
  getAdminLocationOptions,
  getAdminSpecialtyOptions
} from "@/lib/admin-form-options";

export default async function NewCosmeticDoctorPage() {
  const [{ governorates, areas }, specialties] = await Promise.all([
    getAdminLocationOptions(),
    getAdminSpecialtyOptions("COSMETIC_DOCTOR")
  ]);

  const hasGovernorates = governorates.length > 0;
  const hasAreas = areas.length > 0;
  const hasSpecialties = specialties.length > 0;
  const canCreate = hasGovernorates && hasAreas && hasSpecialties;

  return (
    <>
      <AdminFormHeader
        title="إضافة طبيب تجميل"
        backHref="/admin/cosmetic-doctors"
        backLabel="العودة إلى أطباء التجميل"
      />

      <div className="space-y-4">
        <LocationRequirement
          hasGovernorates={hasGovernorates}
          hasAreas={hasAreas}
        />

        {!hasSpecialties ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900">
            يرجى إضافة اختصاص من
            <Link
              href="/admin/cosmetic-doctors"
              className="mx-1 underline"
            >
              صفحة أطباء التجميل
            </Link>
            أولاً، وبعدها ارجع لإضافة الطبيب.
          </p>
        ) : null}

        {canCreate ? (
          <ProviderForm
            mode="create"
            fixedType="COSMETIC_DOCTOR"
            category="COSMETIC"
            action={createCosmeticDoctor}
            governorates={governorates}
            areas={areas}
            specialties={specialties}
          />
        ) : null}
      </div>
    </>
  );
}
