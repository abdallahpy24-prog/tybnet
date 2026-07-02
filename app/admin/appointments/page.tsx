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
import { Select } from "@/components/ui/input";

function formatPreferredDate(value: string | Date | null) {
  if (!value) {
    return "غير محدد";
  }

  if (value instanceof Date) {
    return value.toLocaleString("ar-IQ");
  }

  return value;
}

export default async function AppointmentsPage() {
  const rows = await prisma.appointment.findMany({
    include: {
      provider: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <>
      <PageHeader
        title="المواعيد"
        description="طلبات الحجز القادمة من صفحة تفاصيل مقدم الخدمة."
      />

      {rows.length ? (
        <form action={deleteAllAppointments} className="mb-4 flex justify-end">
          <Button type="submit" variant="secondary">
            حذف جميع المواعيد
          </Button>
        </form>
      ) : null}

      <div className="grid gap-4">
        {rows.length ? (
          rows.map((row) => (
            <Card key={row.id}>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <h2 className="text-xl font-black text-navy">
                    {row.patientName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {row.patientPhone}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {row.provider
                      ? `${row.provider.titlePrefix} ${row.provider.name}`
                      : "بدون طبيب محدد"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    الموعد المفضل: {formatPreferredDate(row.preferredDate)}
                  </p>

                  {row.note ? (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {row.note}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  <form action={updateAppointmentStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={row.id} />

                    <Select name="status" defaultValue={row.status}>
                      <option value="NEW">جديد</option>
                      <option value="FOLLOWING">قيد المتابعة</option>
                      <option value="COMPLETED">مكتمل</option>
                      <option value="CANCELLED">ملغي</option>
                    </Select>

                    <Button type="submit" variant="secondary">
                      حفظ
                    </Button>
                  </form>

                  <form action={deleteAppointment}>
                    <input type="hidden" name="id" value={row.id} />

                    <Button type="submit" variant="secondary">
                      حذف الموعد
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-4 border-t border-borderSoft pt-4">
                <StatusPill value={row.status} />
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm font-bold text-slate-500">
            لا توجد طلبات مواعيد بعد.
          </Card>
        )}
      </div>
    </>
  );
}