import { updateAppointmentStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default async function AppointmentsPage() {
  const rows = await prisma.appointment.findMany({ include: { provider: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="المواعيد" description="طلبات الحجز البسيطة القادمة من صفحة تفاصيل مقدم الخدمة." />
      <div className="grid gap-4">
        {rows.length ? rows.map((row) => (
          <Card key={row.id}>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <h2 className="text-xl font-black text-navy">{row.patientName}</h2>
                <p className="mt-1 text-sm text-slate-600">{row.patientPhone}</p>
                <p className="mt-1 text-sm text-slate-600">{row.provider ? row.provider.titlePrefix + " " + row.provider.name : "بدون طبيب محدد"}</p>
                <p className="mt-1 text-sm text-slate-600">التاريخ المفضل: {formatDate(row.preferredDate)}</p>
                {row.note ? <p className="mt-3 text-sm leading-7 text-slate-600">{row.note}</p> : null}
              </div>
              <form action={updateAppointmentStatus} className="flex gap-2">
                <input type="hidden" name="id" value={row.id} />
                <Select name="status" defaultValue={row.status}><option value="NEW">جديد</option><option value="FOLLOWING">قيد المتابعة</option><option value="COMPLETED">مكتمل</option><option value="CANCELLED">ملغي</option></Select>
                <Button type="submit" variant="secondary">حفظ</Button>
              </form>
            </div>
            <div className="mt-4 border-t border-borderSoft pt-4"><StatusPill value={row.status} /></div>
          </Card>
        )) : <Card className="text-center text-sm font-bold text-slate-500">لا توجد طلبات مواعيد بعد.</Card>}
      </div>
    </>
  );
}
