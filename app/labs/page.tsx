import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { PlaceCard } from "@/components/public/place-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  getPublicLabs,
  readFilters,
  type SearchParams,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "ابحث عن مختبرات طبية في العراق | طب نت",
  description:
    "ابحث عن مختبرات طبية في العراق حسب المحافظة والمنطقة، واطّلع على معلومات التواصل عبر منصة طب نت.",
};

export default async function LabsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, labs] = await Promise.all([
    getFilterOptions(),
    getPublicLabs(params),
  ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="المختبرات"
          title="ابحث عن مختبر طبي حسب المحافظة والمنطقة"
          description="استعرض المختبرات الطبية المتاحة على طب نت، وصفّي النتائج حسب المحافظة أو المنطقة أو اسم المختبر."
        />

        <FilterForm
          action="/labs"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
        />

        {labs.length ? (
          <div className="card-grid">
            {labs.map((item) => (
              <PlaceCard key={item.id} item={item} label="مختبر" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم نجد مختبرات مطابقة لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة، أو ابحث باسم المختبر أو العنوان."
          />
        )}
      </section>
    </SiteShell>
  );
}