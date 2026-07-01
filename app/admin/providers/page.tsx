import { createProvider, deleteProvider, updateProvider } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { ProviderForm } from "@/components/admin/provider-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ProvidersPage() {
  const [governorates, areas, specialties, rows] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    }),
    prisma.area.findMany({
      include: { governorate: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    }),
    prisma.specialty.findMany({
      orderBy: [{ name: "asc" }]
    }),
    prisma.provider.findMany({
      include: {
        governorate: true,
        area: true,
        specialty: true
      },
      orderBy: [{ updatedAt: "desc" }]
    })
  ]);

  const governorateOptions = governorates.map((governorate) => ({
    id: governorate.id,
    name: governorate.name
  }));

  const areaOptions = areas.map((area) => ({
    id: area.id,
    name: area.name,
    governorateId: area.governorateId,
    governorateName: area.governorate.name
  }));

  const specialtyOptions = specialties.map((specialty) => ({
    id: specialty.id,
    name: specialty.name,
    forType: specialty.forType
  }));

  const canCreate =
    governorateOptions.length > 0 &&
    areaOptions.length > 0 &&
    specialtyOptions.length > 0;

  return (
    <>
      <PageHeader
        title="الأطباء وأطباء الأسنان"
        description="إدارة الأطباء وأطباء الأسنان مع اختيار المحافظة والمنطقة والاختصاص بشكل ذكي."
      />

      <FormShell title="إضافة مقدم خدمة">
        {canCreate ? (
          <ProviderForm
            mode="create"
            action={createProvider}
            governorates={governorateOptions}
            areas={areaOptions}
            specialties={specialtyOptions}
          />
        ) : (
          <p className="text-sm font-bold text-red-700">
            أكمل بيانات المحافظات والمناطق والاختصاصات من الإعدادات الأساسية.
          </p>
        )}
      </FormShell>

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <ProviderForm
                mode="edit"
                action={updateProvider}
                governorates={governorateOptions}
                areas={areaOptions}
                specialties={specialtyOptions}
                row={{
                  id: row.id,
                  type: row.type,
                  name: row.name,
                  titlePrefix: row.titlePrefix,
                  specialtyId: row.specialtyId,
                  governorateId: row.governorateId,
                  areaId: row.areaId,
                  slug: row.slug,
                  whatsapp: row.whatsapp,
                  phone: row.phone,
                  instagramUrl: row.instagramUrl,
                  imageUrl: row.imageUrl,
                  status: row.status,
                  sortOrder: row.sortOrder,
                  isFeatured: row.isFeatured,
                  address: row.address,
                  workingHours: row.workingHours,
                  bio: row.bio
                }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
                <div className="flex flex-wrap gap-2">
                  <StatusPill value={row.status} />
                  <span>{row.type}</span>
                  <span>{row.specialty?.name ?? "بدون اختصاص"}</span>
                  <span>
                    {row.governorate.name} - {row.area.name}
                  </span>
                </div>

                <form action={deleteProvider}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="danger">
                    حذف/تعطيل آمن
                  </Button>
                </form>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm font-bold text-slate-500">
            لا توجد بيانات أطباء بعد.
          </Card>
        )}
      </div>
    </>
  );
}