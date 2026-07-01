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
  title: "ابحث عن أطباء في العراق | طب نت",
  description:
    "ابحث عن أطباء في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على بيانات التواصل وطلب المواعيد عبر منصة طب نت."
};

export default async function DoctorsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, doctors] = await Promise.all([
    getFilterOptions("DOCTOR"),
    searchProviders("DOCTOR", params)
  ]);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="الأطباء"
          title="ابحث عن طبيب حسب المحافظة والاختصاص"
          description="استعرض الأطباء المتاحين على طب نت، وصفّي النتائج حسب المحافظة والمنطقة والاختصاص للوصول إلى الطبيب الأنسب لك."
        />

        <FilterForm
          action="/doctors"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          specialties={options.specialties}
        />

        {doctors.length ? (
          <div className="grid gap-4">
            {doctors.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم نجد أطباء مطابقين لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة أو الاختصاص، أو ابحث بكلمة أبسط مثل اسم الطبيب أو نوع الاختصاص."
          />
        )}
      </section>
    </SiteShell>
  );
}