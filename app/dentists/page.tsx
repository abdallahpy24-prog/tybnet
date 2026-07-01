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
  title: "أطباء أسنان في العراق",
  description: "ابحث عن أطباء أسنان في العراق حسب المحافظة والمنطقة والاختصاص عبر طب نت."
};

export default async function DentistsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, dentists] = await Promise.all([
    getFilterOptions("DENTIST"),
    searchProviders("DENTIST", params)
  ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="أطباء الأسنان"
          title="عيادات الأسنان"
          description="قائمة أطباء الأسنان النشطين فقط، مع فلاتر حسب المحافظة والمنطقة واختصاصات الأسنان."
        />

        <FilterForm
          action="/dentists"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          specialties={options.specialties}
        />

        {dentists.length ? (
          <div className="card-grid">
            {dentists.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} compact />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد نتائج مطابقة"
            description="جرّب تغيير المحافظة أو المنطقة أو اختصاص الأسنان."
          />
        )}
      </section>
    </SiteShell>
  );
}