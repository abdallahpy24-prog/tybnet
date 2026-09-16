import { requireAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSearch } from "@/components/admin/admin-search";
import { LocationRequirement } from "@/components/admin/location-requirement";
import { PageHeader } from "@/components/admin/page-header";
import { ProviderAdminList } from "@/components/admin/provider-admin-list";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";
import { prisma } from "@/lib/prisma";

type DentistsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function DentistsPage({
  searchParams
}: DentistsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = parseAdminPage(params.page);
  const where = {
    type: "DENTIST" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { governorate: { name: { contains: q, mode: "insensitive" as const } } },
            { area: { name: { contains: q, mode: "insensitive" as const } } }
          ]
        }
      : {})
  };

  const [governorateCount, areaCount, rows, total] = await Promise.all([
    prisma.governorate.count(),
    prisma.area.count(),
    prisma.provider.findMany({
      where,
      include: {
        specialty: true,
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
    prisma.provider.count({ where })
  ]);

  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (page > lastPage) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && typeof value === "string" && value) query.set(key, value);
    }
    if (lastPage > 1) query.set("page", String(lastPage));
    redirect(`/admin/dentists${query.size ? `?${query.toString()}` : ""}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader
          title="أطباء الأسنان"
          description="قائمة أطباء الأسنان للإدارة والمراجعة، مع تقديم السجلات الأحدث تحققاً بدلاً من نقاط التواصل."
        />

        <Link
          href="/admin/dentists/new"
          className="focus-ring mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary to-primary-dark px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة طبيب أسنان
        </Link>
      </div>

      <LocationRequirement
        hasGovernorates={governorateCount > 0}
        hasAreas={areaCount > 0}
      />

      <AdminSearch
        defaultValue={q}
        placeholder="ابحث عن طبيب أسنان، محافظة أو منطقة..."
      />

      <ProviderAdminList
        rows={rows}
        editBasePath="/admin/dentists"
        emptyText={
          q
            ? "لا توجد نتائج مطابقة."
            : "لا يوجد أطباء أسنان بعد."
        }
      />

      <AdminPagination
        basePath="/admin/dentists"
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        query={{ q: q || undefined }}
      />
    </div>
  );
}
