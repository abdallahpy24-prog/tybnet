import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { ProviderCard } from "@/components/public/provider-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  readFilters,
  searchProviders,
  type SearchParams
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "أطباء التجميل في العراق | طب نت",
  description:
    "ابحث عن أطباء التجميل في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على بيانات التواصل وطلب المواعيد عبر منصة طب نت."
};

export default async function CosmeticDoctorsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, cosmeticDoctors] =
    await Promise.all([
      getFilterOptions("COSMETIC_DOCTOR"),
      searchProviders(
        "COSMETIC_DOCTOR",
        params
      )
    ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="التجميل"
          title="ابحث عن طبيب تجميل حسب المحافظة والاختصاص"
          description="استعرض أطباء التجميل المتاحين على طب نت، وصفّي النتائج حسب المحافظة والمنطقة والاختصاص للوصول إلى الطبيب الأنسب لك."
        />

        <FilterForm
          action="/cosmetic-doctors"
          q={filters.q}
          governorates={
            options.governorates
          }
          areas={options.areas}
          specialties={options.specialties}
        />

        {cosmeticDoctors.length ? (
          <div className="grid gap-4">
            {cosmeticDoctors.map(
              (provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  detailBasePath="/cosmetic-doctors"
                />
              )
            )}
          </div>
        ) : (
          <EmptyState
            title="لم نجد أطباء تجميل مطابقين لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة أو الاختصاص، أو ابحث بكلمة أبسط مثل اسم الطبيب أو نوع الاختصاص."
          />
        )}
      </section>
    </SiteShell>
  );
}