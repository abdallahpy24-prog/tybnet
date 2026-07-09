import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { PlaceCard } from "@/components/public/place-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  getPublicPharmacies,
  readFilters,
  type SearchParams,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "ابحث عن صيدليات في العراق | طب نت",
  description:
    "ابحث عن صيدليات في العراق حسب المحافظة والمنطقة، واطّلع على معلومات التواصل عبر منصة طب نت.",
};

export default async function PharmaciesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, pharmacies] = await Promise.all([
    getFilterOptions(),
    getPublicPharmacies(params),
  ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="الصيدليات"
          title="ابحث عن صيدلية حسب المحافظة والمنطقة"
          description="استعرض الصيدليات المتاحة على طب نت، وصفّي النتائج حسب المحافظة أو المنطقة أو اسم الصيدلية للوصول إلى المكان المناسب."
        />

        <FilterForm
          action="/pharmacies"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
        />

        {pharmacies.length ? (
          <div className="card-grid">
            {pharmacies.map((item) => (
              <PlaceCard key={item.id} item={item} label="صيدلية" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم نجد صيدليات مطابقة لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة، أو ابحث باسم الصيدلية أو العنوان."
          />
        )}
      </section>
    </SiteShell>
  );
}