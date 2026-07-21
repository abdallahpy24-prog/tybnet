import Link from "next/link";
import {
  Activity,
  Building2,
  CalendarDays,
  FileText,
  FlaskConical,
  Pill,
  SmilePlus,
  Sparkles,
  Stethoscope
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const entityLabels: Record<string, string> = {
  Provider: "طبيب",
  CosmeticDoctor: "طبيب تجميل",
  Pharmacy: "صيدلية",
  Lab: "مختبر",
  CosmeticCenter: "مركز تجميل",
  Appointment: "موعد",
  Offer: "عرض",
  Governorate: "محافظة",
  Area: "منطقة",
  Specialty: "اختصاص",
  User: "حساب إداري"
};

const actionLabels: Record<string, string> = {
  create: "إضافة",
  update: "تعديل",
  delete: "حذف",
  "disable-linked": "تعطيل",
  "create-mobile-appointment": "موعد من التطبيق",
  "create-whatsapp-appointment": "موعد من الموقع"
};

function formatActivity(entity: string, action: string) {
  const entityLabel = entityLabels[entity] ?? entity;
  const actionLabel = actionLabels[action] ?? action;

  return `${actionLabel} - ${entityLabel}`;
}

function formatActivityDate(value: Date) {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

export default async function AdminDashboardPage() {
  const [
    doctorCount,
    dentistCount,
    cosmeticDoctorCount,
    pharmacyCount,
    labCount,
    cosmeticCenterCount,
    offerCount,
    appointmentCount,
    recentLogs
  ] = await Promise.all([
    prisma.provider.count({
      where: {
        type: "DOCTOR"
      }
    }),
    prisma.provider.count({
      where: {
        type: "DENTIST"
      }
    }),
    prisma.provider.count({
      where: {
        type: "COSMETIC_DOCTOR"
      }
    }),
    prisma.pharmacy.count(),
    prisma.lab.count(),
    prisma.cosmeticCenter.count(),
    prisma.offer.count(),
    prisma.appointment.count({
      where: {
        status: {
          in: ["NEW", "FOLLOWING"]
        }
      }
    }),
    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 8,
      include: {
        user: true
      }
    })
  ]);

  const cards = [
    {
      label: "الأطباء",
      value: doctorCount,
      href: "/admin/providers",
      icon: Stethoscope
    },
    {
      label: "أطباء الأسنان",
      value: dentistCount,
      href: "/admin/dentists",
      icon: SmilePlus
    },
    {
      label: "أطباء التجميل",
      value: cosmeticDoctorCount,
      href: "/admin/cosmetic-doctors",
      icon: Sparkles
    },
    {
      label: "الصيدليات",
      value: pharmacyCount,
      href: "/admin/pharmacies",
      icon: Pill
    },
    {
      label: "المختبرات",
      value: labCount,
      href: "/admin/labs",
      icon: FlaskConical
    },
    {
      label: "مراكز التجميل",
      value: cosmeticCenterCount,
      href: "/admin/cosmetic-centers",
      icon: Building2
    },
    {
      label: "العروض",
      value: offerCount,
      href: "/admin/offers",
      icon: FileText
    },
    {
      label: "مواعيد تحتاج متابعة",
      value: appointmentCount,
      href: "/admin/appointments",
      icon: CalendarDays
    }
  ];

  return (
    <>
      <PageHeader
        title="الرئيسية"
        description="نظرة سريعة على أقسام طب نت والعمليات الأخيرة. اضغط على أي بطاقة لفتح القسم."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg">
                <Icon
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />

                <p className="mt-4 text-3xl font-black text-navy">
                  {card.value}
                </p>

                <p className="text-sm font-bold text-slate-500">
                  {card.label}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-black text-navy">آخر التحديثات</h2>
        </div>

        <div className="grid gap-3">
          {recentLogs.length ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderSoft p-3 text-sm"
              >
                <div>
                  <p className="font-bold text-navy">
                    {formatActivity(log.entity, log.action)}
                  </p>
                  <p className="text-slate-500">
                    {log.user?.name ?? "النظام"}
                  </p>
                </div>

                <time
                  dateTime={log.createdAt.toISOString()}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {formatActivityDate(log.createdAt)}
                </time>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              لا توجد عمليات مسجلة بعد.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
