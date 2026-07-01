import { PageHeader } from "@/components/admin/page-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AuditPage() {
  const rows = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <PageHeader title="سجل النشاط" description="كل عملية مهمة داخل لوحة الإدارة تسجل هنا مع المستخدم والكيان والتاريخ." />
      <div className="grid gap-3">
        {rows.length ? rows.map((row) => (
          <Card key={row.id} className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-black text-navy">{row.entity} - {row.action}</h2>
              <p className="text-sm text-slate-500">{row.user?.name ?? "النظام"} · {formatDate(row.createdAt)}</p>
              {row.entityId ? <p className="text-xs text-slate-400 ltr">{row.entityId}</p> : null}
            </div>
            <StatusPill value={row.action} />
          </Card>
        )) : <Card className="text-center text-sm font-bold text-slate-500">لا توجد عمليات مسجلة بعد.</Card>}
      </div>
    </>
  );
}
