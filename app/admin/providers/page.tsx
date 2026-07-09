import {
  createProvider,
  deleteProvider,
  updateProvider
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { ProviderForm } from "@/components/admin/provider-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function providerTypeLabel(type: "DOCTOR" | "DENTIST") {
  return type === "DENTIST" ? "طبيب أسنان" : "طبيب";
}

export default async function ProvidersPage() {
  const [governorates, areas, specialties, rows] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    }),

    prisma.area.findMany({
      include: {
        governorate: true
      },
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
      orderBy: [
        { isFeatured: "desc" },
        { bookingPoints: "desc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" }
      ]
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
        description="إدارة الأطباء وأطباء الأسنان من مكان واحد: البيانات، الاختصاص، الموقع، التواصل، الصورة، النقاط، والترتيب."
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
            أكمل بيانات المحافظات والمناطق والاختصاصات أولاً قبل إضافة الأطباء
            وأطباء الأسنان.
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

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {providerTypeLabel(row.type)}
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