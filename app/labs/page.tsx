import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { FilterForm } from "@/components/public/filter-form";
import {
  PlaceResults,
  type PublicPlaceListItem
} from "@/components/public/place-results";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFilterOptions,
  getPublicLabsPage,
  readFilters,
  type SearchParams
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "ابحث عن مختبرات طبية في العراق | طب نت",
  description:
    "ابحث عن مختبرات طبية في العراق حسب المحافظة والمنطقة، واطّلع على معلومات التواصل عبر منصة طب نت."
};

type LabPageItem = Awaited<
  ReturnType<typeof getPublicLabsPage>
>["items"][number];

function toPublicListItem(
  item: LabPageItem
): PublicPlaceListItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    imageUrl: item.imageUrl,
    imageThumbnailUrl: item.imageThumbnailUrl,
    whatsapp: item.whatsapp,
    workingHours: item.workingHours,
    address: item.address,
    inquiryCount: item.inquiryCount,
    governorate: {
      name: item.governorate.name
    },
    area: {
      name: item.area.name
    }
  };
}

export default async function LabsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, labsPage] = await Promise.all([
    getFilterOptions(),
    getPublicLabsPage(params, {
      take: 5
    })
  ]);

  const initialItems = labsPage.items.map(
    toPublicListItem
  );

  const resultsKey = JSON.stringify({
    q: filters.q,
    governorateId: filters.governorateId,
    areaId: filters.areaId
  });

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

        {initialItems.length ? (
          <PlaceResults
            key={resultsKey}
            kind="lab"
            label="مختبر"
            initialItems={initialItems}
            initialCursor={labsPage.nextCursor}
            initialHasMore={labsPage.hasMore}
            filters={{
              q: filters.q,
              governorateId: filters.governorateId,
              areaId: filters.areaId
            }}
          />
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
