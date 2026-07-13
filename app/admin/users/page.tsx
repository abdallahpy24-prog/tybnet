import {
  AtSign,
  ChevronDown,
  Mail,
  ShieldCheck,
  UserCog
} from "lucide-react";

import {
  createUser,
  updateUser
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { AdminSearch } from "@/components/admin/admin-search";
import { FormShell } from "@/components/admin/form-shell";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  Input
} from "@/components/ui/input";

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

export default async function UsersPage({
  searchParams
}: UsersPageProps) {
  const q = (await searchParams).q?.trim() ?? "";

  const rows = await prisma.user.findMany({
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
              email: {
                contains: q,
                mode: "insensitive"
              }
            },
            {
              username: {
                contains: q,
                mode: "insensitive"
              }
            }
          ]
        }
      : undefined,
    orderBy: [
      { isActive: "desc" },
      { name: "asc" }
    ]
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="حسابات الأدمن"
        description="إنشاء حسابات الإدارة وتعديلها أو تعطيلها من صفحة واحدة. جميع الحسابات بصلاحية ADMIN فقط."
      />

      <FormShell title="إضافة حساب أدمن">
        <form
          action={createUser}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <Field label="الاسم">
            <Input
              name="name"
              required
              maxLength={120}
              autoComplete="name"
            />
          </Field>

          <Field label="البريد الإلكتروني">
            <Input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className="ltr"
            />
          </Field>

          <Field label="اسم المستخدم">
            <Input
              name="username"
              required
              minLength={3}
              maxLength={80}
              autoComplete="username"
              className="ltr"
            />
          </Field>

          <Field label="كلمة المرور">
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
            />
          </Field>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800 md:col-span-2 xl:col-span-4">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            الصلاحية: ADMIN
          </div>

          <Button
            type="submit"
            className="md:col-span-2 xl:col-span-4"
          >
            إضافة حساب الأدمن
          </Button>
        </form>
      </FormShell>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-navy">
              حسابات الأدمن
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              اضغط على الحساب لفتح معلوماته وتعديلها.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <AdminSearch
              defaultValue={q}
              placeholder="ابحث بالاسم أو البريد أو اسم المستخدم..."
            />
          </div>
        </div>

        {rows.length ? (
          <div className="divide-y divide-borderSoft overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
            {rows.map((row) => (
              <details key={row.id} className="group">
                <summary className="focus-ring flex cursor-pointer list-none flex-col gap-3 p-3 hover:bg-slate-50 sm:flex-row sm:items-center [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                      <UserCog className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-black text-navy">
                          {row.name}
                        </h3>
                        <StatusPill value={row.isActive} />
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                          ADMIN
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        @{row.username}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <bdi className="truncate">{row.email}</bdi>
                  </span>

                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <div className="border-t border-borderSoft bg-slate-50 p-4 md:p-5">
                  <form
                    action={updateUser}
                    className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={row.id} />

                    <Field label="الاسم">
                      <Input
                        name="name"
                        required
                        maxLength={120}
                        defaultValue={row.name}
                        autoComplete="name"
                      />
                    </Field>

                    <Field label="البريد الإلكتروني">
                      <Input
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                        defaultValue={row.email}
                        autoComplete="email"
                        className="ltr"
                      />
                    </Field>

                    <Field label="اسم المستخدم">
                      <Input
                        name="username"
                        required
                        minLength={3}
                        maxLength={80}
                        defaultValue={row.username}
                        autoComplete="username"
                        className="ltr"
                      />
                    </Field>

                    <Field label="كلمة مرور جديدة">
                      <Input
                        name="password"
                        type="password"
                        minLength={8}
                        maxLength={128}
                        placeholder="اتركها فارغة بدون تغيير"
                        autoComplete="new-password"
                      />
                    </Field>

                    <label className="flex h-11 items-center gap-2 rounded-2xl border border-borderSoft bg-white px-3 text-sm font-bold text-slate-700 md:col-span-2 xl:col-span-1">
                      <input
                        name="isActive"
                        type="checkbox"
                        defaultChecked={row.isActive}
                      />
                      الحساب نشط
                    </label>

                    <div className="flex items-center gap-2 rounded-2xl border border-borderSoft bg-white px-3 text-xs font-bold text-slate-500 md:col-span-2 xl:col-span-2">
                      <AtSign className="h-4 w-4" aria-hidden="true" />
                      أُنشئ في {formatDate(row.createdAt)}
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      className="md:col-span-2 xl:col-span-1"
                    >
                      حفظ التعديل
                    </Button>
                  </form>

                  <p className="mt-4 border-t border-borderSoft pt-4 text-xs font-bold leading-6 text-slate-500">
                    لإيقاف هذا الحساب أزل علامة «الحساب نشط» ثم احفظ.
                    النظام يمنع تعطيل آخر أدمن نشط حمايةً من فقدان الدخول.
                  </p>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center text-sm font-bold text-slate-500">
            {q
              ? "لا توجد حسابات مطابقة للبحث."
              : "لا توجد حسابات أدمن."}
          </Card>
        )}
      </section>
    </div>
  );
}
