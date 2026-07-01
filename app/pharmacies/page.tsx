import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { PlaceCard } from "@/components/public/place-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFilterOptions, getPublicPharmacies, readFilters, type SearchParams } from "@/lib/queries";

export const metadata: Metadata = {
  title: "الصيدليات",
  description: "صيدليات العراق حسب المحافظة والمنطقة عبر طب نت."
};

export default async function PharmaciesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);
  const [options, pharmacies] = await Promise.all([getFilterOptions(), getPublicPharmacies(params)]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle eyebrow="الصيدليات" title="الصيدليات" description="يدعم القسم الفلاتر والظهور العام عند تفعيل الصيدلية من لوحة الإدارة." />
        <FilterForm action="/pharmacies" q={filters.q} governorates={options.governorates} areas={options.areas} showSpecialties={false} />
        {pharmacies.length ? <div className="card-grid">{pharmacies.map((item) => <PlaceCard key={item.id} item={item} label="صيدلية" />)}</div> : <EmptyState title="قسم الصيدليات سيفتح قريباً" description="أو لم تتم إضافة صيدليات نشطة بعد من لوحة الإدارة." />}
      </section>
    </SiteShell>
  );
}
