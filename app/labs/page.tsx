import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import { PlaceCard } from "@/components/public/place-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFilterOptions, getPublicLabs, readFilters, type SearchParams } from "@/lib/queries";

export const metadata: Metadata = {
  title: "المختبرات",
  description: "مختبرات العراق حسب المحافظة والمنطقة عبر طب نت."
};

export default async function LabsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);
  const [options, labs] = await Promise.all([getFilterOptions(), getPublicLabs(params)]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle eyebrow="المختبرات" title="المختبرات الطبية" description="يمكن عرض خدمات المختبر، العنوان، ساعات العمل، واتساب، والفلاتر الأساسية." />
        <FilterForm action="/labs" q={filters.q} governorates={options.governorates} areas={options.areas} showSpecialties={false} />
        {labs.length ? <div className="card-grid">{labs.map((item) => <PlaceCard key={item.id} item={item} label="مختبر" />)}</div> : <EmptyState title="قسم المختبرات سيفتح قريباً" description="أو لم تتم إضافة مختبرات نشطة بعد من لوحة الإدارة." />}
      </section>
    </SiteShell>
  );
}
