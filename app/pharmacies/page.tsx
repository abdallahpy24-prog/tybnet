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
  getPublicPharmaciesPage,
  readFilters,
  type SearchParams
} from "@/lib/queries";

const baseMetadata: Metadata = {
  alternates: { canonical: "/pharmacies" },
  title: "ابحث عن صيدليات في العراق",
  description:
    "ابحث عن صيدليات في العراق حسب المحافظة والمنطقة، واطّلع على معلومات التواصل عبر منصة طب نت."
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<SearchParams> }): Promise<Metadata> {
  return listPageMetadata(baseMetadata, (await searchParams) ?? {});
}

type PharmacyPageItem = Awaited<
  ReturnType<typeof getPublicPharmaciesPage>
>["items"][number];

function toPublicListItem(
  item: PharmacyPageItem
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

export default async function PharmaciesPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, pharmaciesPage] = await Promise.all([
    getFilterOptions(),
    getPublicPharmaciesPage(params, {
      take: 8
    })
  ]);

  const initialItems = pharmaciesPage.items.map(
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
          eyebrow="الصيدليات"
          title="ابحث عن صيدلية حسب المحافظة والمنطقة"
          description="استعرض الصيدليات المتاحة على طب نت، واستخدم عوامل التصفية حسب المحافظة أو المنطقة أو اسم الصيدلية للوصول إلى المكان المناسب."
        />

        <FilterForm
          action="/pharmacies"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          showSpecialties={false}
          placeType="pharmacies"
        />

        {initialItems.length ? (
          <PlaceResults
            key={`${resultsKey}:${Array.isArray(params.cursor) ? params.cursor[0] : params.cursor ?? ""}`}
            kind="pharmacy"
            label="صيدلية"
            initialItems={initialItems}
            initialCursor={pharmaciesPage.nextCursor}
            initialHasMore={pharmaciesPage.hasMore}
            initialTotal={pharmaciesPage.total}
            filters={{
              featuredOnly: filters.featuredOnly,
              q: filters.q,
              governorateId: filters.governorateId,
              areaId: filters.areaId
            }}
          />
        ) : (
          <EmptyState
            title="لم نجد صيدليات مطابقة لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة، أو ابحث باسم الصيدلية أو العنوان."
          />
        )}
      </section>
    </SiteShell>
  );
}
