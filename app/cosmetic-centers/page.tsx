import type { Metadata } from "next";
import { listPageMetadata } from "@/lib/list-metadata";

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

const baseMetadata: Metadata = {
  alternates: { canonical: "/cosmetic-centers" },
  title: "مراكز التجميل في العراق",
  description:
    "ابحث عن مراكز التجميل في العراق حسب المحافظة والمنطقة، واطّلع على الخدمات ومعلومات التواصل عبر منصة طب نت."
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<SearchParams> }): Promise<Metadata> {
  return listPageMetadata(baseMetadata, (await searchParams) ?? {});
}

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
    workingHours: item.workingHours,
    address: item.address,
    lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null,
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
        take: 8
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
          as="h1"
          eyebrow="التجميل"
          title="ابحث عن مركز تجميل حسب المحافظة والمنطقة"
          description="استعرض مراكز التجميل المتاحة على طب نت، واستخدم عوامل التصفية حسب المحافظة أو المنطقة أو اسم المركز."
        />

        <FilterForm
          action="/cosmetic-centers"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
          placeType="cosmetic-centers"
        />

        {initialItems.length ? (
          <PlaceResults
            key={`${resultsKey}:${Array.isArray(params.cursor) ? params.cursor[0] : params.cursor ?? ""}`}
            kind="cosmetic-center"
            label="مركز تجميل"
            initialItems={initialItems}
            initialCursor={cosmeticCentersPage.nextCursor}
            initialHasMore={cosmeticCentersPage.hasMore}
            initialTotal={cosmeticCentersPage.total}
            filters={{
              featuredOnly: filters.featuredOnly,
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
