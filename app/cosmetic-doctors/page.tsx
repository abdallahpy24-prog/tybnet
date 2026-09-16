import type { Metadata } from "next";
import { listPageMetadata } from "@/lib/list-metadata";

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

const baseMetadata: Metadata = {
  alternates: { canonical: "/cosmetic-doctors" },
  title: "أطباء التجميل في العراق",
  description:
    "ابحث عن أطباء التجميل في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على بيانات التواصل وطلب المواعيد عبر منصة طب نت."
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<SearchParams> }): Promise<Metadata> {
  return listPageMetadata(baseMetadata, (await searchParams) ?? {});
}

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
    phone: provider.phone,
    whatsapp: provider.whatsapp,
    address: provider.address,
    lastVerifiedAt: provider.lastVerifiedAt?.toISOString() ?? null,
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
    isFeatured: provider.isFeatured
  };
}

export default async function CosmeticDoctorsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const filters = readFilters(params);

  const [options, cosmeticDoctorsPage] =
    await Promise.all([
      getFilterOptions("COSMETIC_DOCTOR"),
      searchProvidersPage(
        "COSMETIC_DOCTOR",
        params,
        {
          take: 8
        }
      )
    ]);

  const initialItems = cosmeticDoctorsPage.items.map(
    toPublicListItem
  );

  const resultsKey = JSON.stringify(filters);

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          as="h1"
          eyebrow="التجميل"
          title="ابحث عن طبيب تجميل حسب المحافظة والاختصاص"
          description="استعرض أطباء التجميل المتاحين على طب نت، واستخدم عوامل التصفية حسب المحافظة والمنطقة والاختصاص للوصول إلى الطبيب الأنسب لك."
        />

        <FilterForm
          action="/cosmetic-doctors"
          q={filters.q}
          governorates={options.governorates}
          areas={options.areas}
          specialties={options.specialties}
          providerType="COSMETIC_DOCTOR"
        />

        {initialItems.length ? (
          <ProviderResults
            key={`${resultsKey}:${Array.isArray(params.cursor) ? params.cursor[0] : params.cursor ?? ""}`}
            type="COSMETIC_DOCTOR"
            initialItems={initialItems}
            initialCursor={cosmeticDoctorsPage.nextCursor}
            initialHasMore={cosmeticDoctorsPage.hasMore}
            initialTotal={cosmeticDoctorsPage.total}
            filters={filters}
            detailBasePath="/cosmetic-doctors"
          />
        ) : (
          <EmptyState
            title="لم نجد أطباء تجميل مطابقين لبحثك"
            description="جرّب تغيير المحافظة أو المنطقة أو الاختصاص، أو ابحث بكلمة أبسط مثل اسم الطبيب أو نوع الاختصاص."
          />
        )}
      </section>
    </SiteShell>
  );
}
