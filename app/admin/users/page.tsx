import { createUser, updateUser } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

export default async function UsersPage() {
  const rows = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="المستخدمون" description="إدارة حسابات الأدمن والمحررين. يتم إنشاء الأدمن الأول فقط من seed." />
      <FormShell title="إضافة مستخدم">
        <form action={createUser} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="الاسم"><Input name="name" required /></Field>
          <Field label="البريد"><Input name="email" type="email" required className="ltr" /></Field>
          <Field label="اسم المستخدم"><Input name="username" required className="ltr" /></Field>
          <Field label="كلمة المرور"><Input name="password" type="password" required minLength={8} /></Field>
          <Field label="الدور"><Select name="role" defaultValue="EDITOR"><option value="ADMIN">ADMIN</option><option value="EDITOR">EDITOR</option></Select></Field>
          <Button type="submit" className="md:col-span-2 xl:col-span-3">إضافة مستخدم</Button>
        </form>
      </FormShell>
      <div className="grid gap-4">
        {rows.map((row) => (
          <Card key={row.id}>
            <form action={updateUser} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <input type="hidden" name="id" value={row.id} />
              <Field label="الاسم"><Input name="name" defaultValue={row.name} required /></Field>
              <Field label="البريد"><Input name="email" type="email" defaultValue={row.email} required className="ltr" /></Field>
              <Field label="اسم المستخدم"><Input name="username" defaultValue={row.username} required className="ltr" /></Field>
              <Field label="كلمة مرور جديدة"><Input name="password" type="password" minLength={8} placeholder="اتركها فارغة بدون تغيير" /></Field>
              <Field label="الدور"><Select name="role" defaultValue={row.role}><option value="ADMIN">ADMIN</option><option value="EDITOR">EDITOR</option></Select></Field>
              <label className="flex h-11 items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={row.isActive} /> نشط</label>
              <Button type="submit" variant="secondary" className="md:col-span-2 xl:col-span-3">حفظ</Button>
            </form>
            <div className="mt-4 flex gap-2 border-t border-borderSoft pt-4"><StatusPill value={row.role} /><StatusPill value={row.isActive} /></div>
          </Card>
        ))}
      </div>
    </>
  );
}
