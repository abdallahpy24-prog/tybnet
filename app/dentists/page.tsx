import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import {
  ProviderResults,
  type PublicProviderListItem
} from "@/components/public/provider-results";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  readFilters,
  searchProvidersPage,
  type SearchParams
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "ابحث عن أطباء أسنان في العراق | طب نت",
  description:
    "ابحث عن أطباء أسنان وعيادات أسنان في العراق حسب المحافظة والمنطقة عبر منصة طب نت."
};

type ProviderPageItem = Awaited<
  ReturnType<typeof searchProvidersPage>
>["items"][number];

function toPublicListItem(
  provider: ProviderPageItem
): PublicProviderListItem {
  return {
    id: provider.id,
    name: provider.name,
    titlePrefix: provider.titlePrefix,
    slug: provider.slug,
    imageUrl: provider.imageUrl,
    imageThumbnailUrl: provider.imageThumbnailUrl,
    whatsapp: provider.whatsapp,
    instagramUrl: provider.instagramUrl,
    specialty: provider.specialty
      ? {
          name: provider.specialty.name
        }
      : null,
    governorate: {
      name: provider.governorate.name
    },
    area: {
      name: provider.area.name
    },
    isFeatured: provider.isFeatured,
    bookingPoints: provider.bookingPoints
  };
}

export default async function DentistsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, dentistsPage] = await Promise.all([
    getFilterOptions(),
    searchProvidersPage("DENTIST", params, {
      take: 5
    })
  ]);

  const initialItems = dentistsPage.items.map(
    toPublicListItem
  );

  const resultsKey = JSON.stringify(filters);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="أطباء الأسنان"
          title="ابحث عن طبيب أسنان قريب منك"
          description="استعرض أطباء الأسنان المتاحين على طب نت، واستخدم عوامل التصفية حسب المحافظة والمنطقة للوصول إلى العيادة الأنسب لك."
        />

        <FilterForm
          action="/dentists"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
        />

        {initialItems.length ? (
          <ProviderResults
            key={resultsKey}
            type="DENTIST"
            initialItems={initialItems}
            initialCursor={dentistsPage.nextCursor}
            initialHasMore={dentistsPage.hasMore}
            filters={filters}
            compact
            gridClassName="card-grid"
            showSpecialty={false}
          />
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
