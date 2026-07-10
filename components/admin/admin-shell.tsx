import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
  Stethoscope,
  Tags,
  Users
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/governorates", label: "المحافظات", icon: Map },
  { href: "/admin/areas", label: "المناطق", icon: MapPin },
  { href: "/admin/specialties", label: "الاختصاصات", icon: Tags },
  { href: "/admin/providers", label: "الأطباء", icon: Stethoscope },
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
  { href: "/admin/pharmacies", label: "الصيدليات", icon: Pill },
  { href: "/admin/labs", label: "المختبرات", icon: FlaskConical },
  { href: "/admin/offers", label: "العروض", icon: FileText },
  {
    href: "/admin/appointments",
    label: "المواعيد",
    icon: CalendarDays
  },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/audit", label: "سجل النشاط", icon: Activity }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-l border-borderSoft bg-white p-5 lg:min-h-screen">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="طب نت"
            width={56}
            height={54}
            className="h-14 w-14 object-contain"
          />
          <div>
            <p className="text-lg font-black text-navy">لوحة طب نت</p>
            <p className="text-xs font-bold text-primary-dark">
              Abdullah Hamed
            </p>
          </div>
        </div>

        <nav className="grid gap-2">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-primary-soft hover:text-primary-dark"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 grid gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-primary-soft"
          >
            <Home className="h-4 w-4" />
            العودة للموقع
          </Link>

          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="w-full justify-start">
              <Shield className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </aside>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}