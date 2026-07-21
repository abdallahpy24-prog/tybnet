import Link from "next/link";
import {
  Activity,
  ChevronDown,
  Clock3,
  FileJson,
  Search,
  UserRound
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Input,
  Select
} from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

type AuditPageProps = {
  searchParams: Promise<{
    q?: string;
    entity?: string;
  }>;
};

const actionLabels: Record<string, string> = {
  create: "إضافة",
  update: "تعديل",
  delete: "حذف",
  "disable-linked": "تعطيل آمن",
  "create-mobile-appointment": "موعد من التطبيق",
  "create-whatsapp-appointment": "موعد من الموقع"
};

const entityLabels: Record<string, string> = {
  User: "حساب إداري",
  Governorate: "محافظة",
  Area: "منطقة",
  Specialty: "اختصاص",
  Provider: "طبيب",
  Pharmacy: "صيدلية",
  Lab: "مختبر",
  CosmeticCenter: "مركز تجميل",
  Offer: "عرض",
  Appointment: "موعد",
  Setting: "إعداد"
};

function actionLabel(value: string) {
  return actionLabels[value] ?? value;
}

function entityLabel(value: string) {
  return entityLabels[value] ?? value;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default async function AuditPage({
  searchParams
}: AuditPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const entity = params.entity?.trim() ?? "";

  const [entityRows, rows] = await Promise.all([
    prisma.auditLog.findMany({
      distinct: ["entity"],
      select: {
        entity: true
      },
      orderBy: {
        entity: "asc"
      }
    }),
    prisma.auditLog.findMany({
      where: {
        ...(entity ? { entity } : {}),
        ...(q
          ? {
              OR: [
                {
                  action: {
                    contains: q,
                    mode: "insensitive"
                  }
                },
                {
                  entity: {
                    contains: q,
                    mode: "insensitive"
                  }
                },
                {
                  entityId: {
                    contains: q,
                    mode: "insensitive"
                  }
                },
                {
                  user: {
                    name: {
                      contains: q,
                      mode: "insensitive"
                    }
                  }
                }
              ]
            }
          : {})
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 200
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل النشاط"
        description="سجل أمني للعمليات المهمة داخل لوحة الإدارة، مرتب من الأحدث إلى الأقدم."
      />

      <Card>
        <form
          method="get"
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto_auto] md:items-end"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            البحث
            <Input
              name="q"
              defaultValue={q}
              placeholder="العملية، العنصر، المعرف أو اسم المسؤول..."
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            نوع العنصر
            <Select name="entity" defaultValue={entity}>
              <option value="">جميع العناصر</option>
              {entityRows.map((row) => (
                <option key={row.entity} value={row.entity}>
                  {entityLabel(row.entity)}
                </option>
              ))}
            </Select>
          </label>

          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" />
            بحث
          </Button>

          <Link
            href="/admin/audit"
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-borderSoft bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            مسح التصفية
          </Link>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-black text-navy">
          آخر العمليات
        </h2>
        <p className="mt-1 text-xs font-bold text-slate-500">
          النتائج: {rows.length} — يعرض آخر 200 عملية كحد أقصى.
        </p>
      </div>

      {rows.length ? (
        <div className="divide-y divide-borderSoft overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
          {rows.map((row) => (
            <details key={row.id} className="group">
              <summary className="focus-ring flex cursor-pointer list-none flex-col gap-3 p-3 hover:bg-slate-50 sm:flex-row sm:items-center [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                    <Activity className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-black text-navy">
                        {entityLabel(row.entity)} — {actionLabel(row.action)}
                      </h3>
                      <StatusPill value={row.action} />
                    </div>

                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      {row.user?.name ?? "النظام"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(row.createdAt)}
                </span>

                <ChevronDown
                  className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <div className="border-t border-borderSoft bg-slate-50 p-4 md:p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      نوع العنصر
                    </p>
                    <p className="mt-2 text-sm font-black text-navy">
                      {entityLabel(row.entity)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      العملية
                    </p>
                    <p className="mt-2 text-sm font-black text-navy">
                      {actionLabel(row.action)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      معرف العنصر
                    </p>
                    <p className="ltr mt-2 break-all text-xs font-bold text-navy">
                      {row.entityId ?? "غير متوفر"}
                    </p>
                  </div>
                </div>

                {row.beforeJson !== null || row.afterJson !== null ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {row.beforeJson !== null ? (
                      <section className="min-w-0 rounded-2xl border border-borderSoft bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <FileJson
                            className="h-4 w-4 text-slate-500"
                            aria-hidden="true"
                          />
                          <h4 className="text-sm font-black text-navy">
                            البيانات قبل العملية
                          </h4>
                        </div>
                        <pre className="ltr max-h-80 overflow-auto rounded-xl bg-slate-950 p-3 text-left text-xs leading-6 text-slate-100">
                          {formatJson(row.beforeJson)}
                        </pre>
                      </section>
                    ) : null}

                    {row.afterJson !== null ? (
                      <section className="min-w-0 rounded-2xl border border-borderSoft bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <FileJson
                            className="h-4 w-4 text-slate-500"
                            aria-hidden="true"
                          />
                          <h4 className="text-sm font-black text-navy">
                            البيانات بعد العملية
                          </h4>
                        </div>
                        <pre className="ltr max-h-80 overflow-auto rounded-xl bg-slate-950 p-3 text-left text-xs leading-6 text-slate-100">
                          {formatJson(row.afterJson)}
                        </pre>
                      </section>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-borderSoft bg-white p-4 text-sm font-bold text-slate-500">
                    لا توجد تفاصيل إضافية محفوظة لهذه العملية.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-sm font-bold text-slate-500">
          {q || entity
            ? "لا توجد عمليات مطابقة للبحث والتصفية."
            : "لا توجد عمليات مسجلة بعد."}
        </Card>
      )}
    </div>
  );
}
