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
  title: "ابحث عن أطباء في العراق | طب نت",
  description:
    "ابحث عن أطباء في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على بيانات التواصل وطلب المواعيد عبر منصة طب نت."
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

export default async function DoctorsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, doctorsPage] = await Promise.all([
    getFilterOptions("DOCTOR"),
    searchProvidersPage("DOCTOR", params, {
      take: 5
    })
  ]);

  const initialItems = doctorsPage.items.map(
    toPublicListItem
  );

  const resultsKey = JSON.stringify(filters);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="الأطباء"
          title="ابحث عن طبيب حسب المحافظة والاختصاص"
          description="استعرض الأطباء المتاحين على طب نت، واستخدم عوامل التصفية حسب المحافظة والمنطقة والاختصاص للوصول إلى الطبيب الأنسب لك."
        />

        <FilterForm
          action="/doctors"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          specialties={options.specialties}
        />

        {initialItems.length ? (
          <ProviderResults
            key={resultsKey}
            type="DOCTOR"
            initialItems={initialItems}
            initialCursor={doctorsPage.nextCursor}
            initialHasMore={doctorsPage.hasMore}
            filters={filters}
          />
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
