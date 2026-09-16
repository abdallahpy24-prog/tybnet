import { requireAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSearch } from "@/components/admin/admin-search";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { PageHeader } from "@/components/admin/page-header";
import { ServicePlaceAdminList } from "@/components/admin/service-place-admin-list";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";
import { prisma } from "@/lib/prisma";

type CosmeticCentersPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function CosmeticCentersPage({
  searchParams
}: CosmeticCentersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = parseAdminPage(params.page);
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { governorate: { name: { contains: q, mode: "insensitive" as const } } },
          { area: { name: { contains: q, mode: "insensitive" as const } } }
        ]
      }
    : undefined;

  const [governorateCount, areaCount, rows, total] = await Promise.all([
    prisma.governorate.count(),
    prisma.area.count(),
    prisma.cosmeticCenter.findMany({
      where,
      include: {
        governorate: true,
        area: true
      },
      orderBy: [
        { lastVerifiedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
        { id: "desc" }
      ],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE
    }),
    prisma.cosmeticCenter.count({ where })
  ]);

  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (page > lastPage) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && typeof value === "string" && value) query.set(key, value);
    }
    if (lastPage > 1) query.set("page", String(lastPage));
    redirect(`/admin/cosmetic-centers${query.size ? `?${query.toString()}` : ""}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader
          title="مراكز التجميل"
          description="قائمة مراكز التجميل للإدارة والمراجعة، دون اعتبار محاولات التواصل تقييماً أو ترتيب جودة."
        />

        <Link
          href="/admin/cosmetic-centers/new"
          className="focus-ring mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary to-primary-dark px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة مركز تجميل
        </Link>
      </div>

      <LocationRequirement
        hasGovernorates={governorateCount > 0}
        hasAreas={areaCount > 0}
      />

      <AdminSearch
        defaultValue={q}
        placeholder="ابحث عن مركز تجميل، محافظة أو منطقة..."
      />

      <ServicePlaceAdminList
        rows={rows}
        editBasePath="/admin/cosmetic-centers"
        emptyText={
          q
            ? "لا توجد نتائج مطابقة."
            : "لا توجد مراكز تجميل بعد."
        }
      />

      <AdminPagination
        basePath="/admin/cosmetic-centers"
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        query={{ q: q || undefined }}
      />
    </div>
  );
}
