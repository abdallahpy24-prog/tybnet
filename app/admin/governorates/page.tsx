import { createGovernorate, deleteGovernorate, updateGovernorate } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";

export default async function GovernoratesPage() {
  const rows = await prisma.governorate.findMany({
    include: { _count: { select: { areas: true, providers: true, pharmacies: true, labs: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });

  return (
    <>
      <PageHeader title="المحافظات" description="تبدأ فارغة بعد seed، والأدمن يضيفها من هنا بدون أي hardcoded data." />
      <FormShell title="إضافة محافظة">
        <form action={createGovernorate} className="grid gap-4 md:grid-cols-[1fr_1fr_140px_110px] md:items-end">
          <Field label="الاسم"><Input name="name" required placeholder="بغداد" /></Field>
          <Field label="Slug اختياري"><Input name="slug" placeholder="baghdad" className="ltr" /></Field>
          <Field label="الترتيب"><Input name="sortOrder" type="number" defaultValue={0} /></Field>
          <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <Button type="submit" className="md:col-span-4">إضافة محافظة</Button>
        </form>
      </FormShell>
      <div className="grid gap-4">
        {rows.length ? rows.map((row) => (
          <Card key={row.id}>
            <form action={updateGovernorate} className="grid gap-3 lg:grid-cols-[1fr_1fr_120px_100px_110px] lg:items-end">
              <input type="hidden" name="id" value={row.id} />
              <Field label="الاسم"><Input name="name" defaultValue={row.name} required /></Field>
              <Field label="Slug"><Input name="slug" defaultValue={row.slug} className="ltr" /></Field>
              <Field label="الترتيب"><Input name="sortOrder" type="number" defaultValue={row.sortOrder} /></Field>
              <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={row.isActive} /> نشط</label>
              <Button type="submit" variant="secondary">حفظ</Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
              <div className="flex flex-wrap gap-2"><StatusPill value={row.isActive} /><span>مناطق: {row._count.areas}</span><span>أطباء: {row._count.providers}</span><span>صيدليات: {row._count.pharmacies}</span><span>مختبرات: {row._count.labs}</span></div>
              <form action={deleteGovernorate}><input type="hidden" name="id" value={row.id} /><Button type="submit" variant="danger">حذف/تعطيل آمن</Button></form>
            </div>
          </Card>
        )) : <Card className="text-center text-sm font-bold text-slate-500">لا توجد محافظات بعد. اضغط إضافة محافظة للبدء.</Card>}
      </div>
    </>
  );
}
