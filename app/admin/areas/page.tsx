import { createArea, deleteArea, updateArea } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

export default async function AreasPage() {
  const [governorates, rows] = await Promise.all([
    prisma.governorate.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.area.findMany({ include: { governorate: true, _count: { select: { providers: true, pharmacies: true, labs: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
  ]);

  return (
    <>
      <PageHeader title="المناطق" description="لا يمكن إضافة منطقة بدون محافظة، وكل اسم منطقة فريد داخل محافظته فقط." />
      <FormShell title="إضافة منطقة">
        {governorates.length ? (
          <form action={createArea} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_120px_100px] md:items-end">
            <Field label="المحافظة"><Select name="governorateId" required>{governorates.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
            <Field label="اسم المنطقة"><Input name="name" required placeholder="الكرادة" /></Field>
            <Field label="Slug اختياري"><Input name="slug" className="ltr" placeholder="karrada" /></Field>
            <Field label="الترتيب"><Input name="sortOrder" type="number" defaultValue={0} /></Field>
            <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
            <Button type="submit" className="md:col-span-5">إضافة منطقة</Button>
          </form>
        ) : <p className="text-sm font-bold text-red-700">يجب إضافة محافظة أولاً.</p>}
      </FormShell>
      <div className="grid gap-4">
        {rows.length ? rows.map((row) => (
          <Card key={row.id}>
            <form action={updateArea} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_100px_90px_110px] lg:items-end">
              <input type="hidden" name="id" value={row.id} />
              <Field label="المحافظة"><Select name="governorateId" defaultValue={row.governorateId}>{governorates.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
              <Field label="الاسم"><Input name="name" defaultValue={row.name} required /></Field>
              <Field label="Slug"><Input name="slug" defaultValue={row.slug} className="ltr" /></Field>
              <Field label="الترتيب"><Input name="sortOrder" type="number" defaultValue={row.sortOrder} /></Field>
              <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={row.isActive} /> نشط</label>
              <Button type="submit" variant="secondary">حفظ</Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
              <div className="flex flex-wrap gap-2"><StatusPill value={row.isActive} /><span>{row.governorate.name}</span><span>أطباء: {row._count.providers}</span><span>صيدليات: {row._count.pharmacies}</span><span>مختبرات: {row._count.labs}</span></div>
              <form action={deleteArea}><input type="hidden" name="id" value={row.id} /><Button type="submit" variant="danger">حذف/تعطيل آمن</Button></form>
            </div>
          </Card>
        )) : <Card className="text-center text-sm font-bold text-slate-500">لا توجد مناطق بعد.</Card>}
      </div>
    </>
  );
}
