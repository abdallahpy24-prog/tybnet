import {
  createCosmeticDoctor,
  deleteCosmeticDoctor,
  updateCosmeticDoctor
} from "@/lib/actions/cosmetic";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { ProviderForm } from "@/components/admin/provider-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function CosmeticDoctorsPage() {
  const [governorates, areas, specialties, rows] =
    await Promise.all([
      prisma.governorate.findMany({
        orderBy: [
          { sortOrder: "asc" },
          { name: "asc" }
        ]
      }),

      prisma.area.findMany({
        include: {
          governorate: true
        },
        orderBy: [
          { sortOrder: "asc" },
          { name: "asc" }
        ]
      }),

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
          type: "COSMETIC_DOCTOR"
        },
        include: {
          governorate: true,
          area: true,
          specialty: true
        },
        orderBy: [
          { isFeatured: "desc" },
          { bookingPoints: "desc" },
          { sortOrder: "asc" },
          { updatedAt: "desc" }
        ]
      })
    ]);

  const governorateOptions = governorates.map(
    (governorate) => ({
      id: governorate.id,
      name: governorate.name
    })
  );

  const areaOptions = areas.map((area) => ({
    id: area.id,
    name: area.name,
    governorateId: area.governorateId,
    governorateName: area.governorate.name
  }));

  const specialtyOptions = specialties.map(
    (specialty) => ({
      id: specialty.id,
      name: specialty.name,
      forType: specialty.forType
    })
  );

  const canCreate =
    governorateOptions.length > 0 &&
    areaOptions.length > 0 &&
    specialtyOptions.some(
      (specialty) => specialty.forType === "COSMETIC_DOCTOR"
    );

  return (
    <>
      <PageHeader
        title="أطباء التجميل"
        description="إدارة أطباء التجميل بصورة مستقلة: الاختصاص، الموقع، التواصل، الصورة، النقاط، الظهور والترتيب."
      />

      <FormShell title="إضافة طبيب تجميل">
        {canCreate ? (
          <ProviderForm
            mode="create"
            category="COSMETIC"
            action={createCosmeticDoctor}
            governorates={governorateOptions}
            areas={areaOptions}
            specialties={specialtyOptions}
          />
        ) : (
          <div className="space-y-2 text-sm font-bold text-red-700">
            <p>
              أكمل بيانات المحافظات والمناطق أولاً.
            </p>
            <p>
              يجب أيضاً إضافة اختصاص واحد على الأقل من نوع
              أطباء التجميل داخل صفحة الاختصاصات.
            </p>
          </div>
        )}
      </FormShell>

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <ProviderForm
                mode="edit"
                category="COSMETIC"
                action={updateCosmeticDoctor}
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
                  mapurl: row.mapurl,
                  imageUrl: row.imageUrl,
                  status: row.status,
                  sortOrder: row.sortOrder,
                  bookingPoints: row.bookingPoints,
                  isFeatured: row.isFeatured,
                  address: row.address,
                  workingHours: row.workingHours,
                  bio: row.bio
                }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={row.status} />

                  <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-extrabold text-fuchsia-700">
                    طبيب تجميل
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {row.specialty?.name ?? "بدون اختصاص"}
                  </span>

                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary-dark">
                    النقاط: {row.bookingPoints}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {row.governorate.name} - {row.area.name}
                  </span>

                  {row.isFeatured ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                      مميز
                    </span>
                  ) : null}

                  {row.imageUrl ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      صورة
                    </span>
                  ) : null}

                  {row.mapurl ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                      لوكيشن
                    </span>
                  ) : null}

                  {row.whatsapp ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">
                      واتساب
                    </span>
                  ) : null}

                  {row.instagramUrl ? (
                    <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-extrabold text-pink-700">
                      إنستغرام
                    </span>
                  ) : null}
                </div>

                <form action={deleteCosmeticDoctor}>
                  <input
                    type="hidden"
                    name="id"
                    value={row.id}
                  />

                  <Button type="submit" variant="danger">
                    حذف/تعطيل آمن
                  </Button>
                </form>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm font-bold text-slate-500">
            لا يوجد أطباء تجميل بعد.
          </Card>
        )}
      </div>
    </>
  );
}