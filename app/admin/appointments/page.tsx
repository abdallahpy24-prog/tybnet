import Link from "next/link";
import {
  CalendarClock,
  ChevronDown,
  Phone,
  Search,
  Trash2,
  UserRound
} from "lucide-react";

import {
  deleteAllAppointments,
  deleteAppointment,
  updateAppointmentStatus
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Input,
  Select
} from "@/components/ui/input";

type AppointmentStatus =
  | "NEW"
  | "FOLLOWING"
  | "COMPLETED"
  | "CANCELLED";

type AppointmentsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function getStatus(value?: string): AppointmentStatus | undefined {
  if (
    value === "NEW" ||
    value === "FOLLOWING" ||
    value === "COMPLETED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return undefined;
}

function formatCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

export default async function AppointmentsPage({
  searchParams
}: AppointmentsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = getStatus(params.status);

  const rows = await prisma.appointment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              {
                patientName: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                patientPhone: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                preferredDate: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                note: {
                  contains: q,
                  mode: "insensitive"
                }
              },
              {
                provider: {
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
      provider: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواعيد"
        description="البحث في طلبات المواعيد ومتابعتها وتحديث حالتها أو حذفها من صفحة واحدة."
      />

      <Card>
        <form
          method="get"
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto] md:items-end"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            البحث
            <Input
              name="q"
              defaultValue={q}
              placeholder="اسم المراجع، رقم الهاتف، الطبيب أو الموعد..."
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            حالة الموعد
            <Select name="status" defaultValue={status ?? ""}>
              <option value="">جميع الحالات</option>
              <option value="NEW">جديد</option>
              <option value="FOLLOWING">قيد المتابعة</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغى</option>
            </Select>
          </label>

          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" />
            بحث
          </Button>

          <Link
            href="/admin/appointments"
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-borderSoft bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            مسح التصفية
          </Link>
        </form>
      </Card>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black text-navy">
            قائمة المواعيد
          </h2>
          <p className="mt-1 text-xs font-bold text-slate-500">
            النتائج: {rows.length} — اضغط على الموعد لفتح تفاصيله.
          </p>
        </div>

        {rows.length && !q && !status ? (
          <details className="relative">
            <summary className="focus-ring inline-flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 [&::-webkit-details-marker]:hidden">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              حذف جميع الطلبات
            </summary>

            <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-red-200 bg-white p-4 shadow-xl">
              <p className="text-sm font-bold leading-6 text-red-700">
                هذا الإجراء يحذف جميع طلبات المواعيد نهائياً ولا يمكن التراجع عنه.
              </p>

              <form action={deleteAllAppointments} className="mt-3">
                <Button type="submit" variant="danger" className="w-full">
                  تأكيد حذف الجميع
                </Button>
              </form>
            </div>
          </details>
        ) : null}
      </div>

      {rows.length ? (
        <div className="divide-y divide-borderSoft overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
          {rows.map((row) => (
            <details key={row.id} className="group">
              <summary className="focus-ring flex cursor-pointer list-none flex-col gap-3 p-3 hover:bg-slate-50 sm:flex-row sm:items-center [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-black text-navy">
                        {row.patientName}
                      </h3>
                      <StatusPill value={row.status} />
                    </div>

                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      {row.provider
                        ? `${row.provider.titlePrefix} ${row.provider.name}`
                        : "لا يوجد طبيب محدد"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  <bdi>{row.patientPhone}</bdi>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <CalendarClock
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {row.preferredDate || "لم يُحدد موعد مفضل"}
                </span>

                <ChevronDown
                  className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <div className="border-t border-borderSoft bg-slate-50 p-4 md:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      اليوم والوقت المفضلان
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-black text-navy">
                      {row.preferredDate || "غير محدد"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      تاريخ استلام الطلب
                    </p>
                    <p className="mt-2 text-sm font-black text-navy">
                      {formatCreatedAt(row.createdAt)}
                    </p>
                  </div>
                </div>

                {row.note ? (
                  <div className="mt-4 rounded-2xl border border-borderSoft bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">
                      الملاحظة
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                      {row.note}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-borderSoft pt-4 sm:flex-row sm:items-end">
                  <form
                    action={updateAppointmentStatus}
                    className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="id" value={row.id} />

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      تحديث الحالة
                      <Select name="status" defaultValue={row.status}>
                        <option value="NEW">جديد</option>
                        <option value="FOLLOWING">قيد المتابعة</option>
                        <option value="COMPLETED">مكتمل</option>
                        <option value="CANCELLED">ملغى</option>
                      </Select>
                    </label>

                    <Button type="submit" variant="secondary">
                      حفظ الحالة
                    </Button>
                  </form>

                  <form action={deleteAppointment}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="danger">
                      حذف الموعد
                    </Button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-sm font-bold text-slate-500">
          {q || status
            ? "لا توجد مواعيد مطابقة للبحث والتصفية."
            : "لا توجد طلبات مواعيد بعد."}
        </Card>
      )}
    </div>
  );
}
