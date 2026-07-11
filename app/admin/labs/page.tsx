import { createLab, deleteLab, updateLab } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { ServicePlaceForm } from "@/components/admin/service-place-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LabsAdminPage() {
  const [governorates, areas, rows] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),

    prisma.area.findMany({
      include: {
        governorate: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),

    prisma.lab.findMany({
      include: {
        governorate: true,
        area: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { inquiryCount: "desc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
    }),
  ]);

  const governorateOptions = governorates.map((governorate) => ({
    id: governorate.id,
    name: governorate.name,
  }));

  const areaOptions = areas.map((area) => ({
    id: area.id,
    name: area.name,
    governorateId: area.governorateId,
    governorateName: area.governorate.name,
  }));

  const canCreate = governorateOptions.length > 0 && areaOptions.length > 0;

  return (
    <>
      <PageHeader
        title="المختبرات"
        description="إدارة بروفايلات المختبرات: النبذة، الخدمات والتحاليل، الصورة، الموقع، التواصل، أوقات الدوام، وعدد النقاط."
      />

      <FormShell title="إضافة مختبر">
        {canCreate ? (
          <ServicePlaceForm
            kind="lab"
            action={createLab}
            governorates={governorateOptions}
            areas={areaOptions}
            submit="إضافة مختبر"
          />
        ) : (
          <p className="text-sm font-bold text-red-700">
            أضف محافظة ومنطقة أولاً قبل إضافة المختبرات.
          </p>
        )}
      </FormShell>

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <ServicePlaceForm
                kind="lab"
                action={updateLab}
                governorates={governorateOptions}
                areas={areaOptions}
                submit="حفظ التعديل"
                row={{
                  id: row.id,
                  name: row.name,
                  slug: row.slug,
                  governorateId: row.governorateId,
                  areaId: row.areaId,
                  whatsapp: row.whatsapp,
                  phone: row.phone,
                  imageUrl: row.imageUrl,
                  status: row.status,
                  isFeatured: row.isFeatured,
                  address: row.address,
                  mapurl: row.mapurl,
                  workingHours: row.workingHours,
                  bio: row.bio,
                  services: row.services,
                  sortOrder: row.sortOrder,
                  inquiryCount: row.inquiryCount,
                }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={row.status} />

                  <span>
                    {row.governorate.name} - {row.area.name}
                  </span>

                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
                    {row.inquiryCount} استفسار
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    ترتيب {row.sortOrder}
                  </span>

                  {row.isFeatured ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                      مميز
                    </span>
                  ) : null}

                  {row.bio ? (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700">
                      نبذة
                    </span>
                  ) : null}

                  {row.services ? (
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700">
                      خدمات
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

                  {row.phone ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                      اتصال
                    </span>
                  ) : null}
                </div>

                <form action={deleteLab}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="danger">
                    حذف
                  </Button>
                </form>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm font-bold text-slate-500">
            لا توجد مختبرات بعد.
          </Card>
        )}
      </div>
    </>
  );
}