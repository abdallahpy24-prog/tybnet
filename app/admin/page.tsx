import { Activity, FlaskConical, FileText, Pill, SmilePlus, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [doctorCount, dentistCount, pharmacyCount, labCount, offerCount, recentLogs] = await Promise.all([
    prisma.provider.count({ where: { type: "DOCTOR" } }),
    prisma.provider.count({ where: { type: "DENTIST" } }),
    prisma.pharmacy.count(),
    prisma.lab.count(),
    prisma.offer.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } })
  ]);

  const cards = [
    { label: "عدد الأطباء", value: doctorCount, icon: Stethoscope },
    { label: "عدد أطباء الأسنان", value: dentistCount, icon: SmilePlus },
    { label: "عدد الصيدليات", value: pharmacyCount, icon: Pill },
    { label: "عدد المختبرات", value: labCount, icon: FlaskConical },
    { label: "عدد العروض", value: offerCount, icon: FileText }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="نظرة سريعة على بيانات منصة طب نت وسجل النشاط الأخير." />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-3xl font-black text-navy">{card.value}</p>
              <p className="text-sm font-bold text-slate-500">{card.label}</p>
            </Card>
          );
        })}
      </div>
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black text-navy">آخر التحديثات</h2>
        </div>
        <div className="grid gap-3">
          {recentLogs.length ? recentLogs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderSoft p-3 text-sm">
              <div>
                <p className="font-bold text-navy">{log.entity} - {log.action}</p>
                <p className="text-slate-500">{log.user?.name ?? "النظام"}</p>
              </div>
              <StatusPill value={log.createdAt.toLocaleDateString("ar-IQ")} />
            </div>
          )) : <p className="text-sm text-slate-500">لا توجد عمليات مسجلة بعد.</p>}
        </div>
      </Card>
    </>
  );
}