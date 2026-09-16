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
  alternates: { canonical: "/doctors" },
  title: "ابحث عن أطباء في العراق",
  description:
    "ابحث عن أطباء في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على بيانات التواصل وطلب المواعيد عبر منصة طب نت."
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
      take: 8
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
          as="h1"
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
          providerType="DOCTOR"
        />

        {initialItems.length ? (
          <ProviderResults
            key={`${resultsKey}:${Array.isArray(params.cursor) ? params.cursor[0] : params.cursor ?? ""}`}
            type="DOCTOR"
            initialItems={initialItems}
            initialCursor={doctorsPage.nextCursor}
            initialHasMore={doctorsPage.hasMore}
            initialTotal={doctorsPage.total}
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
