import Link from "next/link";
import { MapPin, Plus, Save, Trash2 } from "lucide-react";

import { AdminSearch } from "@/components/admin/admin-search";
import { FormShell } from "@/components/admin/form-shell";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import {
  createArea,
  deleteArea,
  updateArea
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

type AreasPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function AreasPage({
  searchParams
}: AreasPageProps) {
  const q = (await searchParams).q?.trim() ?? "";

  const [governorates, rows] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ]
    }),
    prisma.area.findMany({
      where: q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                slug: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                governorate: {
                  name: {
                    contains: q,
                    mode: "insensitive"
                  }
                }
              }
            ]
          }
        : undefined,
      include: {
        governorate: true,
        _count: {
          select: {
            providers: true,
            pharmacies: true,
            labs: true,
            cosmeticCenters: true
          }
        }
      },
      orderBy: [
        {
          governorate: {
            sortOrder: "asc"
          }
        },
        { sortOrder: "asc" },
        { name: "asc" }
      ]
    })
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="المناطق"
        description="إضافة وتعديل وترتيب المناطق من صفحة واحدة. الرقم الأصغر يظهر أولاً داخل المحافظة."
      />

      <FormShell title="إضافة منطقة">
        {governorates.length ? (
          <form
            action={createArea}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_140px_auto_auto] md:items-end"
          >
            <Field label="المحافظة">
              <Select name="governorateId" required>
                {governorates.map((governorate) => (
                  <option key={governorate.id} value={governorate.id}>
                    {governorate.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="اسم المنطقة">
              <Input
                name="name"
                required
                maxLength={120}
                placeholder="الكرادة"
              />
            </Field>

            <Field label="الرابط المختصر - اختياري">
              <Input
                name="slug"
                maxLength={120}
                placeholder="karrada"
                className="ltr"
              />
            </Field>

            <Field label="الترتيب">
              <Input
                name="sortOrder"
                type="number"
                min={0}
                max={1_000_000}
                defaultValue={0}
                required
              />
            </Field>

            <label className="flex h-11 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-bold">
              <input name="isActive" type="checkbox" defaultChecked />
              نشطة
            </label>

            <Button type="submit">
              <Plus className="h-4 w-4" aria-hidden="true" />
              إضافة
            </Button>
          </form>
        ) : (
          <p className="text-sm font-bold leading-7 text-amber-800">
            يجب إضافة
            <Link href="/admin/governorates" className="mx-1 underline">
              محافظة
            </Link>
            أولاً قبل إنشاء منطقة.
          </p>
        )}
      </FormShell>

      <AdminSearch
        defaultValue={q}
        placeholder="ابحث عن منطقة أو محافظة..."
      />

      {rows.length ? (
        <div className="divide-y divide-borderSoft overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
          {rows.map((row) => (
            <details key={row.id} className="group bg-white">
              <summary className="flex cursor-pointer list-none flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-navy">{row.name}</h2>
                      <StatusPill value={row.isActive} />
                    </div>

                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      {row.governorate.name} • {row.slug}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-primary-dark">
                    ترتيب {row.sortOrder}
                  </span>
                  <span>{row._count.providers} طبيب</span>
                  <span>•</span>
                  <span>{row._count.pharmacies} صيدلية</span>
                  <span>•</span>
                  <span>{row._count.labs} مختبر</span>
                  <span>•</span>
                  <span>{row._count.cosmeticCenters} مركز</span>
                </div>

                <span className="text-xs font-black text-primary-dark">
                  تعديل
                </span>
              </summary>

              <div className="space-y-3 border-t border-borderSoft bg-slate-50 p-3">
                <form
                  action={updateArea}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_140px_auto_auto] md:items-end"
                >
                  <input type="hidden" name="id" value={row.id} />

                  <Field label="المحافظة">
                    <Select
                      name="governorateId"
                      defaultValue={row.governorateId}
                      required
                    >
                      {governorates.map((governorate) => (
                        <option key={governorate.id} value={governorate.id}>
                          {governorate.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="اسم المنطقة">
                    <Input
                      name="name"
                      required
                      maxLength={120}
                      defaultValue={row.name}
                    />
                  </Field>

                  <Field label="الرابط المختصر">
                    <Input
                      name="slug"
                      maxLength={120}
                      defaultValue={row.slug}
                      className="ltr"
                    />
                  </Field>

                  <Field label="الترتيب">
                    <Input
                      name="sortOrder"
                      type="number"
                      min={0}
                      max={1_000_000}
                      defaultValue={row.sortOrder}
                      required
                    />
                  </Field>

                  <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={row.isActive}
                    />
                    نشطة
                  </label>

                  <Button type="submit" variant="secondary">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    حفظ
                  </Button>
                </form>

                <form action={deleteArea} className="flex justify-end">
                  <input type="hidden" name="id" value={row.id} />

                  <Button type="submit" variant="danger" className="h-9">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    حذف أو تعطيل إذا مرتبطة ببيانات
                  </Button>
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-sm font-bold text-slate-500">
          {q
            ? "لا توجد نتائج مطابقة."
            : "لا توجد مناطق بعد. أضف أول منطقة للبدء."}
        </Card>
      )}
    </div>
  );
}
