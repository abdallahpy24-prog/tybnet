"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarDays,
  FileText,
  FlaskConical,
  Home,
  LayoutDashboard,
  Map,
  MapPin,
  Pill,
  Settings,
  Shield,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

const navItems = [
  {
    href: "/admin",
    label: "الرئيسية",
    icon: LayoutDashboard
  },
  {
    href: "/admin/appointments",
    label: "المواعيد",
    icon: CalendarDays
  },
  {
    href: "/admin/providers",
    label: "الأطباء",
    icon: Stethoscope
  },
  {
    href: "/admin/dentists",
    label: "أطباء الأسنان",
    icon: SmilePlus
  },
  {
    href: "/admin/cosmetic-doctors",
    label: "أطباء التجميل",
    icon: Sparkles
  },
  {
    href: "/admin/cosmetic-centers",
    label: "مراكز التجميل",
    icon: Building2
  },
  {
    href: "/admin/pharmacies",
    label: "الصيدليات",
    icon: Pill
  },
  {
    href: "/admin/labs",
    label: "المختبرات",
    icon: FlaskConical
  },
  {
    href: "/admin/offers",
    label: "العروض",
    icon: FileText
  },
  {
    href: "/admin/governorates",
    label: "المحافظات",
    icon: Map
  },
  {
    href: "/admin/areas",
    label: "المناطق",
    icon: MapPin
  },
  {
    href: "/admin/users",
    label: "حسابات الإدارة",
    icon: Users
  },
  {
    href: "/admin/settings",
    label: "الإعدادات",
    icon: Settings
  },
  {
    href: "/admin/audit",
    label: "سجل النشاط",
    icon: Activity
  }
];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="border-b border-borderSoft bg-white p-3 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-l lg:p-5">
        <div className="mb-3 flex items-center gap-3 lg:mb-6">
          <Image
            src="/assets/logo.png"
            alt="طب نت"
            width={56}
            height={54}
            className="h-14 w-14 object-contain"
            priority
          />

          <div>
            <p className="text-lg font-black text-navy">لوحة طب نت</p>
            <p className="text-xs font-bold text-primary-dark">
              إدارة المنصة
            </p>
          </div>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0"
          aria-label="أقسام لوحة الإدارة"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition lg:py-3 ${
                  isActive
                    ? "bg-primary-soft text-primary-dark"
                    : "bg-slate-50 text-slate-600 hover:bg-primary-soft hover:text-primary-dark lg:bg-transparent"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 flex gap-2 lg:mt-4 lg:grid">
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-primary-soft lg:justify-start lg:py-3"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            العودة للموقع
          </Link>

          <form action={logoutAction} className="flex-1">
            <Button
              type="submit"
              variant="secondary"
              className="w-full justify-start"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
