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
  getPublicCosmeticCentersPage,
  readFilters,
  type SearchParams
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "مراكز التجميل في العراق | طب نت",
  description:
    "ابحث عن مراكز التجميل في العراق حسب المحافظة والمنطقة، واطّلع على الخدمات ومعلومات التواصل عبر منصة طب نت."
};

type CosmeticCenterPageItem = Awaited<
  ReturnType<typeof getPublicCosmeticCentersPage>
>["items"][number];

function toPublicListItem(
  item: CosmeticCenterPageItem
): PublicPlaceListItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    imageUrl: item.imageUrl,
    imageThumbnailUrl: item.imageThumbnailUrl,
    whatsapp: item.whatsapp,
    instagramUrl: item.instagramUrl,
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

export default async function CosmeticCentersPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, cosmeticCentersPage] =
    await Promise.all([
      getFilterOptions(),
      getPublicCosmeticCentersPage(params, {
        take: 5
      })
    ]);

  const initialItems = cosmeticCentersPage.items.map(
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
          eyebrow="التجميل"
          title="ابحث عن مركز تجميل حسب المحافظة والمنطقة"
          description="استعرض مراكز التجميل المتاحة على طب نت، وصفّي النتائج حسب المحافظة أو المنطقة أو اسم المركز."
        />

        <FilterForm
          action="/cosmetic-centers"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
        />

        {initialItems.length ? (
          <PlaceResults
            key={resultsKey}
            kind="cosmetic-center"
            label="مركز تجميل"
            initialItems={initialItems}
            initialCursor={cosmeticCentersPage.nextCursor}
            initialHasMore={cosmeticCentersPage.hasMore}
            filters={{
              q: filters.q,
              governorateId: filters.governorateId,
              areaId: filters.areaId
            }}
          />
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
