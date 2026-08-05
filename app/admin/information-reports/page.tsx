import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flag,
  Search,
  XCircle
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  rejectInformationReport,
  resolveInformationReport
} from "@/lib/actions/information-reports";
import { prisma } from "@/lib/prisma";

const issueLabels: Record<string, string> = {
  PHONE: "رقم الهاتف أو واتساب",
  ADDRESS: "العنوان",
  WORKING_HOURS: "أوقات العمل",
  SPECIALTY_SERVICES: "الاختصاص أو الخدمات",
  MAP_LOCATION: "الموقع على الخريطة",
  CLOSED_OR_UNAVAILABLE: "المكان مغلق أو غير متاح",
  OTHER: "معلومة أخرى"
};

const entityLabels: Record<string, string> = {
  PROVIDER: "طبيب / مقدم خدمة",
  PHARMACY: "صيدلية",
  LAB: "مختبر",
  COSMETIC_CENTER: "مركز تجميل"
};

const statusLabels: Record<string, string> = {
  NEW: "جديد",
  RESOLVED: "تم التصحيح والتحقق",
  REJECTED: "مرفوض"
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

function entityHref(entityType: string, slug: string) {
  if (entityType === "PROVIDER") return `/providers/${slug}`;
  if (entityType === "PHARMACY") return `/pharmacies/${slug}`;
  if (entityType === "LAB") return `/labs/${slug}`;
  if (entityType === "COSMETIC_CENTER") return `/cosmetic-centers/${slug}`;
  return "/";
}

function statusClasses(status: string) {
  if (status === "RESOLVED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-800";
}

type InformationReportsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    entityType?: string;
  }>;
};

export default async function InformationReportsPage({
  searchParams
}: InformationReportsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status?.trim() || "NEW";
  const entityType = params.entityType?.trim() || "";

  const rows = await prisma.informationReport.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(entityType ? { entityType } : {}),
      ...(q
        ? {
            OR: [
              { entityName: { contains: q, mode: "insensitive" } },
              { entitySlug: { contains: q, mode: "insensitive" } },
              { details: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 250
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="بلاغات المعلومات"
        description="راجع البلاغات الواردة من التطبيق. عند اختيار «تم التصحيح والتحقق» يتحدث تاريخ آخر تحقق الظاهر للمستخدم تلقائياً."
      />

      <Card>
        <form
          method="get"
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto] lg:items-end"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            البحث
            <Input
              name="q"
              defaultValue={q}
              placeholder="اسم مقدم الخدمة أو تفاصيل البلاغ..."
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            الحالة
            <Select name="status" defaultValue={status}>
              <option value="">جميع الحالات</option>
              <option value="NEW">جديد</option>
              <option value="RESOLVED">تم التصحيح والتحقق</option>
              <option value="REJECTED">مرفوض</option>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            نوع الجهة
            <Select name="entityType" defaultValue={entityType}>
              <option value="">جميع الجهات</option>
              {Object.entries(entityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" />
            بحث
          </Button>

          <Link
            href="/admin/information-reports"
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-borderSoft bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            مسح التصفية
          </Link>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-black text-navy">البلاغات</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">
          النتائج: {rows.length} — يعرض آخر 250 بلاغاً كحد أقصى.
        </p>
      </div>

      {rows.length ? (
        <div className="grid gap-4">
          {rows.map((row) => (
            <Card key={row.id} className="p-0 overflow-hidden">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClasses(
                        row.status
                      )}`}
                    >
                      {statusLabels[row.status] || row.status}
                    </span>

                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      {entityLabels[row.entityType] || row.entityType}
                    </span>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700">
                      <Flag className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-black text-navy">
                        {row.entityName}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-primary-dark">
                        {issueLabels[row.issueType] || row.issueType}
                      </p>
                    </div>
                  </div>

                  {row.details ? (
                    <div className="mt-4 rounded-2xl border border-borderSoft bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500">
                        تفاصيل المستخدم
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {row.details}
                      </p>
                    </div>
                  ) : null}

                  {row.adminNote ? (
                    <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        ملاحظة الإدارة
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-emerald-900">
                        {row.adminNote}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(row.createdAt)}
                    </span>

                    <Link
                      href={entityHref(row.entityType, row.entitySlug)}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-primary-dark hover:underline"
                    >
                      فتح الصفحة
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>

              {row.status === "NEW" ? (
                <div className="grid gap-4 border-t border-borderSoft bg-slate-50 p-5 xl:grid-cols-2">
                  <form action={resolveInformationReport} className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4">
                    <input type="hidden" name="id" value={row.id} />
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      ملاحظة المعالجة (اختيارية)
                      <Textarea
                        name="adminNote"
                        maxLength={700}
                        placeholder="مثال: تم تعديل رقم الهاتف والتأكد من مقدم الخدمة."
                      />
                    </label>
                    <Button type="submit">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      تم التصحيح والتحقق
                    </Button>
                  </form>

                  <form action={rejectInformationReport} className="grid gap-3 rounded-2xl border border-red-100 bg-white p-4">
                    <input type="hidden" name="id" value={row.id} />
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      سبب الرفض (اختياري)
                      <Textarea
                        name="adminNote"
                        maxLength={700}
                        placeholder="مثال: تم الاتصال وتأكدنا أن المعلومة الحالية صحيحة."
                      />
                    </label>
                    <Button type="submit" variant="danger">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      رفض البلاغ
                    </Button>
                  </form>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-sm font-bold text-slate-500">
          لا توجد بلاغات مطابقة حالياً.
        </Card>
      )}
    </div>
  );
}
