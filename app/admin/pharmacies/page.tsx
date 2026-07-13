import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminSearch } from "@/components/admin/admin-search";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { PageHeader } from "@/components/admin/page-header";
import { ServicePlaceAdminList } from "@/components/admin/service-place-admin-list";
import { prisma } from "@/lib/prisma";

type PharmaciesAdminPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function PharmaciesAdminPage({
  searchParams
}: PharmaciesAdminPageProps) {
  const q = (await searchParams).q?.trim() ?? "";

  const [governorateCount, areaCount, rows] = await Promise.all([
    prisma.governorate.count(),
    prisma.area.count(),
    prisma.pharmacy.findMany({
      where: q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive" as const
                }
              },
              {
                governorate: {
                  name: {
                    contains: q,
                    mode: "insensitive" as const
                  }
                }
              },
              {
                area: {
                  name: {
                    contains: q,
                    mode: "insensitive" as const
                  }
                }
              }
            ]
          }
        : undefined,
      include: {
        governorate: true,
        area: true
      },
      orderBy: [
        { inquiryCount: "desc" },
        { updatedAt: "desc" }
      ]
    })
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader
          title="الصيدليات"
          description="قائمة صغيرة مرتبة تلقائياً حسب نقاط الاستفسار."
        />

        <Link
          href="/admin/pharmacies/new"
          className="focus-ring mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary to-primary-dark px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة صيدلية
        </Link>
      </div>

      <LocationRequirement
        hasGovernorates={governorateCount > 0}
        hasAreas={areaCount > 0}
      />

      <AdminSearch
        defaultValue={q}
        placeholder="ابحث عن صيدلية، محافظة أو منطقة..."
      />

      <ServicePlaceAdminList
        rows={rows}
        editBasePath="/admin/pharmacies"
        emptyText={
          q
            ? "لا توجد نتائج مطابقة."
            : "لا توجد صيدليات بعد."
        }
      />
    </div>
  );
}
