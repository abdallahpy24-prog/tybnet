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
  title: "ابحث عن أطباء أسنان في العراق | طب نت",
  description:
    "ابحث عن أطباء أسنان وعيادات أسنان في العراق حسب المحافظة والمنطقة عبر منصة طب نت."
};

export default async function DentistsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, dentists] = await Promise.all([
    getFilterOptions(),
    searchProviders("DENTIST", params)
  ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="أطباء الأسنان"
          title="ابحث عن طبيب أسنان قريب منك"
          description="استعرض أطباء الأسنان المتاحين على طب نت، وصفّي النتائج حسب المحافظة والمنطقة للوصول إلى العيادة الأنسب لك."
        />

        <FilterForm
          action="/dentists"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
        />

        {dentists.length ? (
          <div className="card-grid">
            {dentists.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                compact
                showSpecialty={false}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم نجد أطباء أسنان مطابقين لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة، أو ابحث بكلمة أبسط مثل اسم الطبيب أو نوع خدمة الأسنان."
          />
        )}
      </section>
    </SiteShell>
  );
}