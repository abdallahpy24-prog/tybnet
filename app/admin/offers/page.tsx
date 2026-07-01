import { createOffer, deleteOffer, updateOffer } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

export default async function OffersAdminPage() {
  const [providers, rows] = await Promise.all([
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
    prisma.offer.findMany({ include: { provider: true }, orderBy: [{ updatedAt: "desc" }] })
  ]);
  return (
    <>
      <PageHeader title="العروض" description="العرض النشط وغير المنتهي يظهر في الواجهة العامة، ويمكن ربطه بطبيب أو طبيب أسنان." />
      <FormShell title="إضافة عرض">
        <form action={createOffer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="العنوان"><Input name="title" required /></Field>
          <Field label="نسبة الخصم"><Input name="discountText" placeholder="خصم 20%" /></Field>
          <Field label="مقدم الخدمة"><Select name="providerId"><option value="">بدون ربط</option>{providers.map((p) => <option key={p.id} value={p.id}>{p.titlePrefix} {p.name}</option>)}</Select></Field>
          <Field label="تاريخ البداية"><Input name="startsAt" type="date" /></Field>
          <Field label="تاريخ النهاية"><Input name="endsAt" type="date" /></Field>
          <Field label="الصورة URL"><Input name="imageUrl" className="ltr" /></Field>
          <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <Field label="الوصف"><Textarea name="description" /></Field>
          <Button type="submit" className="md:col-span-2 xl:col-span-3">إضافة عرض</Button>
        </form>
      </FormShell>
      <div className="grid gap-4">
        {rows.length ? rows.map((row) => (
          <Card key={row.id}>
            <form action={updateOffer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <input type="hidden" name="id" value={row.id} />
              <Field label="العنوان"><Input name="title" defaultValue={row.title} required /></Field>
              <Field label="Slug"><Input name="slug" defaultValue={row.slug} className="ltr" /></Field>
              <Field label="نسبة الخصم"><Input name="discountText" defaultValue={row.discountText ?? ""} /></Field>
              <Field label="مقدم الخدمة"><Select name="providerId" defaultValue={row.providerId ?? ""}><option value="">بدون ربط</option>{providers.map((p) => <option key={p.id} value={p.id}>{p.titlePrefix} {p.name}</option>)}</Select></Field>
              <Field label="تاريخ البداية"><Input name="startsAt" type="date" defaultValue={row.startsAt ? row.startsAt.toISOString().slice(0, 10) : ""} /></Field>
              <Field label="تاريخ النهاية"><Input name="endsAt" type="date" defaultValue={row.endsAt ? row.endsAt.toISOString().slice(0, 10) : ""} /></Field>
              <Field label="الصورة URL"><Input name="imageUrl" defaultValue={row.imageUrl ?? ""} className="ltr" /></Field>
              <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={row.isActive} /> نشط</label>
              <Field label="الوصف"><Textarea name="description" defaultValue={row.description ?? ""} /></Field>
              <Button type="submit" variant="secondary" className="md:col-span-2 xl:col-span-3">حفظ</Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4 text-sm text-slate-600">
              <div className="flex flex-wrap gap-2"><StatusPill value={row.isActive} /><span>{row.provider ? row.provider.titlePrefix + " " + row.provider.name : "غير مرتبط"}</span></div>
              <form action={deleteOffer}><input type="hidden" name="id" value={row.id} /><Button type="submit" variant="danger">حذف</Button></form>
            </div>
          </Card>
        )) : <Card className="text-center text-sm font-bold text-slate-500">لا توجد عروض بعد.</Card>}
      </div>
    </>
  );
}
