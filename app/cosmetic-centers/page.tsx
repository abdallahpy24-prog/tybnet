import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { PlaceCard } from "@/components/public/place-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  getPublicCosmeticCenters,
  readFilters,
  type SearchParams
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "مراكز التجميل في العراق | طب نت",
  description:
    "ابحث عن مراكز التجميل في العراق حسب المحافظة والمنطقة، واطّلع على الخدمات ومعلومات التواصل عبر منصة طب نت."
};

export default async function CosmeticCentersPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, cosmeticCenters] =
    await Promise.all([
      getFilterOptions(),
      getPublicCosmeticCenters(params)
    ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="التجميل"
          title="ابحث عن مركز تجميل حسب المحافظة والمنطقة"
          description="استعرض مراكز التجميل المتاحة على طب نت، وصفّي النتائج حسب المحافظة أو المنطقة أو اسم المركز."
        />

        <FilterForm
          action="/cosmetic-centers"
          q={filters.q}
          governorates={
            options.governorates
          }
          areas={options.areas}
          showSpecialties={false}
        />

        {cosmeticCenters.length ? (
          <div className="card-grid">
            {cosmeticCenters.map((item) => (
              <PlaceCard
                key={item.id}
                item={item}
                label="مركز تجميل"
                kind="cosmetic-center"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم نجد مراكز تجميل مطابقة لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة، أو ابحث باسم مركز التجميل أو إحدى خدماته."
          />
        )}
      </section>
    </SiteShell>
  );
}