import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminSearch } from "@/components/admin/admin-search";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { PageHeader } from "@/components/admin/page-header";
import { ProviderAdminList } from "@/components/admin/provider-admin-list";
import { SpecialtyManager } from "@/components/admin/specialty-manager";
import { prisma } from "@/lib/prisma";

type CosmeticDoctorsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function CosmeticDoctorsPage({
  searchParams
}: CosmeticDoctorsPageProps) {
  const q = (await searchParams).q?.trim() ?? "";

  const [governorateCount, areaCount, specialties, rows] =
    await Promise.all([
      prisma.governorate.count(),
      prisma.area.count(),
      prisma.specialty.findMany({
        where: {
          forType: "COSMETIC_DOCTOR"
        },
        orderBy: [
          { isActive: "desc" },
          { name: "asc" }
        ]
      }),
      prisma.provider.findMany({
        where: {
          type: "COSMETIC_DOCTOR",
          ...(q
            ? {
                OR: [
                  {
                    name: {
                      contains: q,
                      mode: "insensitive" as const
                    }
                  },
                  {
                    specialty: {
                      name: {
                        contains: q,
                        mode: "insensitive" as const
                      }
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
            : {})
        },
        include: {
          specialty: true,
          governorate: true,
          area: true
        },
        orderBy: [
          { bookingPoints: "desc" },
          { updatedAt: "desc" }
        ]
      })
    ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader
          title="أطباء التجميل"
          description="قائمة أطباء التجميل مرتبة تلقائياً حسب النقاط، وتُدار اختصاصاتهم بصورة مستقلة ضمن هذا القسم."
        />

        <Link
          href="/admin/cosmetic-doctors/new"
          className="focus-ring mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary to-primary-dark px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة طبيب تجميل
        </Link>
      </div>

      <LocationRequirement
        hasGovernorates={governorateCount > 0}
        hasAreas={areaCount > 0}
      />

      <SpecialtyManager
        forType="COSMETIC_DOCTOR"
        rows={specialties}
      />

      <AdminSearch
        defaultValue={q}
        placeholder="ابحث عن طبيب تجميل، اختصاص، محافظة أو منطقة..."
      />

      <ProviderAdminList
        rows={rows}
        editBasePath="/admin/cosmetic-doctors"
        emptyText={
          q
            ? "لا توجد نتائج مطابقة."
            : "لا يوجد أطباء تجميل بعد."
        }
      />
    </div>
  );
}
