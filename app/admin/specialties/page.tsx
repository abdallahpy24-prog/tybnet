import { SpecialtyFor } from "@prisma/client";

import {
  createSpecialty,
  deleteSpecialty,
  updateSpecialty
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

const typeLabels: Record<SpecialtyFor, string> = {
  DOCTOR: "أطباء",
  DENTIST: "أطباء أسنان",
  COSMETIC_DOCTOR: "أطباء تجميل",
  BOTH: "أطباء وأطباء أسنان"
};

export default async function SpecialtiesPage() {
  const rows = await prisma.specialty.findMany({
    include: {
      _count: {
        select: {
          providers: true
        }
      }
    },
    orderBy: [
      { forType: "asc" },
      { name: "asc" }
    ]
  });

  return (
    <>
      <PageHeader
        title="الاختصاصات"
        description="إدارة اختصاصات الأطباء وأطباء الأسنان وأطباء التجميل، ويظهر كل اختصاص داخل فلاتر فئته فقط."
      />

      <FormShell title="إضافة اختصاص">
        <form
          action={createSpecialty}
          className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_120px_100px] md:items-end"
        >
          <Field label="الاسم">
            <Input
              name="name"
              required
              placeholder="مثلاً: الجلدية والتجميل"
            />
          </Field>

          <Field label="الفئة">
            <Select name="forType" defaultValue="DOCTOR">
              <option value="DOCTOR">أطباء</option>
              <option value="DENTIST">أطباء أسنان</option>
              <option value="COSMETIC_DOCTOR">
                أطباء تجميل
              </option>
              <option value="BOTH">
                أطباء وأطباء أسنان
              </option>
            </Select>
          </Field>

          <Field label="الأيقونة">
            <Input
              name="icon"
              placeholder="stethoscope"
            />
          </Field>

          <Field label="Slug">
            <Input name="slug" className="ltr" />
          </Field>

          <label className="flex h-11 items-center gap-2 text-sm font-bold">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
            />
            نشط
          </label>

          <Button type="submit" className="md:col-span-5">
            إضافة اختصاص
          </Button>
        </form>
      </FormShell>

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <form
                action={updateSpecialty}
                className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_90px_110px] lg:items-end"
              >
                <input
                  type="hidden"
                  name="id"
                  value={row.id}
                />

                <Field label="الاسم">
                  <Input
                    name="name"
                    defaultValue={row.name}
                    required
                  />
                </Field>

                <Field label="الفئة">
                  <Select
                    name="forType"
                    defaultValue={row.forType}
                  >
                    <option value="DOCTOR">أطباء</option>
                    <option value="DENTIST">
                      أطباء أسنان
                    </option>
                    <option value="COSMETIC_DOCTOR">
                      أطباء تجميل
                    </option>
                    <option value="BOTH">
                      أطباء وأطباء أسنان
                    </option>
                  </Select>
                </Field>

                <Field label="الأيقونة">
                  <Input
                    name="icon"
                    defaultValue={row.icon ?? ""}
                  />
                </Field>

                <Field label="Slug">
                  <Input
                    name="slug"
                    defaultValue={row.slug}
                    className="ltr"
                  />
                </Field>

                <label className="flex h-11 items-center gap-2 text-sm font-bold">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={row.isActive}
                  />
                  نشط
                </label>

                <Button type="submit" variant="secondary">
                  حفظ
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill value={row.isActive} />

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {typeLabels[row.forType]}
                  </span>

                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary-dark">
                    مستخدم مع: {row._count.providers}
                  </span>
                </div>

                <form action={deleteSpecialty}>
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
            لا توجد اختصاصات بعد.
          </Card>
        )}
      </div>
    </>
  );
}