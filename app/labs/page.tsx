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
  getPublicLabsPage,
  readFilters,
  type SearchParams
} from "@/lib/queries";

const baseMetadata: Metadata = {
  alternates: { canonical: "/labs" },
  title: "ابحث عن مختبرات طبية في العراق",
  description:
    "ابحث عن مختبرات طبية في العراق حسب المحافظة والمنطقة، واطّلع على معلومات التواصل عبر منصة طب نت."
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<SearchParams> }): Promise<Metadata> {
  return listPageMetadata(baseMetadata, (await searchParams) ?? {});
}

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
    phone: item.phone,
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
      take: 8
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
          as="h1"
          eyebrow="المختبرات"
          title="ابحث عن مختبر طبي حسب المحافظة والمنطقة"
          description="استعرض المختبرات الطبية المتاحة على طب نت، واستخدم عوامل التصفية حسب المحافظة أو المنطقة أو اسم المختبر."
        />

        <FilterForm
          action="/labs"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
          placeType="labs"
        />

        {initialItems.length ? (
          <PlaceResults
            key={`${resultsKey}:${Array.isArray(params.cursor) ? params.cursor[0] : params.cursor ?? ""}`}
            kind="lab"
            label="مختبر"
            initialItems={initialItems}
            initialCursor={labsPage.nextCursor}
            initialHasMore={labsPage.hasMore}
            initialTotal={labsPage.total}
            filters={{
              featuredOnly: filters.featuredOnly,
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
