"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  FlaskConical,
  LogIn,
  Menu,
  Palette,
  Pill,
  Search,
  SmilePlus,
  Sparkles,
  Stethoscope,
  UserPlus,
  X
} from "lucide-react";

import { buttonStyles } from "@/components/ui/button";

const serviceLinks = [
  {
    href: "/doctors",
    label: "الأطباء",
    description: "ابحث حسب المحافظة والاختصاص والمنطقة",
    icon: Stethoscope
  },
  {
    href: "/dentists",
    label: "أطباء الأسنان",
    description: "اعثر على طبيب أسنان قريب منك",
    icon: SmilePlus
  },
  {
    href: "/pharmacies",
    label: "الصيدليات",
    description: "تواصل مع الصيدليات حسب منطقتك",
    icon: Pill
  },
  {
    href: "/labs",
    label: "المختبرات",
    description: "مختبرات وتحاليل حسب المحافظة والمنطقة",
    icon: FlaskConical
  },
  {
    href: "/cosmetic-doctors",
    label: "أطباء التجميل",
    description: "أطباء جراحة وتجميل ضمن الدليل",
    icon: Sparkles
  },
  {
    href: "/cosmetic-centers",
    label: "مراكز التجميل",
    description: "استعرض المراكز والخدمات التجميلية",
    icon: Building2
  }
];

const primaryLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/offers", label: "العروض" },
  { href: "/medical-marketing", label: "التسويق الطبي" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (document.getElementById("services-menu")?.contains(document.activeElement)) servicesButtonRef.current?.focus();
        else if (document.getElementById("mobile-main-menu")?.contains(document.activeElement)) menuButtonRef.current?.focus();
        setIsMenuOpen(false);
        setIsServicesOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const serviceSectionActive = serviceLinks.some((item) =>
    isActivePath(pathname, item.href)
  );

  return (
    <header className="sticky top-0 z-50 border-b border-borderSoft/90 bg-white/95 backdrop-blur-xl">
      <div className="container-page flex min-h-[72px] items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-xl"
          aria-label="الصفحة الرئيسية - طب نت"
        >
          <Image
            src="/assets/logo.png"
            alt=""
            width={48}
            height={46}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="hidden text-lg font-black text-navy sm:inline">
            طب نت
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="التنقل الرئيسي"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={[
              "rounded-xl px-3 py-2 text-sm font-bold transition",
              pathname === "/"
                ? "bg-primary-soft text-primary-dark"
                : "text-slate-600 hover:bg-surface hover:text-navy"
            ].join(" ")}
          >
            الرئيسية
          </Link>

          <div ref={servicesRef} className="relative">
            <button
              type="button"
              onClick={() => setIsServicesOpen((value) => !value)}
              aria-expanded={isServicesOpen}
              ref={servicesButtonRef}
              aria-controls="services-menu"
              aria-current={serviceSectionActive ? "page" : undefined}
              className={[
                "focus-ring inline-flex min-h-10 items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold transition",
                serviceSectionActive
                  ? "bg-primary-soft text-primary-dark"
                  : "text-slate-600 hover:bg-surface hover:text-navy"
              ].join(" ")}
            >
              الخدمات
              <ChevronDown
                className={`h-4 w-4 transition ${isServicesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {isServicesOpen ? (
              <div
                id="services-menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] w-[560px] rounded-2xl border border-borderSoft bg-white p-3 shadow-2xl"
              >
                <div className="grid grid-cols-2 gap-2">
                  {serviceLinks.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex items-start gap-3 rounded-xl p-3 transition",
                          active
                            ? "bg-primary-soft"
                            : "hover:bg-surface"
                        ].join(" ")}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-navy">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {primaryLinks.slice(1).map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-bold transition",
                  active
                    ? "bg-primary-soft text-primary-dark"
                    : "text-slate-600 hover:bg-surface hover:text-navy"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto hidden items-center gap-2 lg:flex">
          <Link
            href="/doctors"
            className={buttonStyles({
              variant: "ghost",
              className: "h-10 min-h-10 px-3"
            })}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            ابحث
          </Link>

          <Link
            href="/join"
            className={buttonStyles({
              variant: "secondary",
              className: "h-10 min-h-10 whitespace-nowrap px-3"
            })}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            انضم إلى طب نت
          </Link>

          <Link
            href="/login"
            aria-label="لوحة الإدارة"
            title="لوحة الإدارة"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-surface hover:text-navy"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          ref={menuButtonRef}
          aria-controls="mobile-main-menu"
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          className="focus-ring ms-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-borderSoft bg-white text-navy lg:hidden"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-main-menu"
          onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setIsMenuOpen(false); }}
          className="border-t border-borderSoft bg-white lg:hidden"
        >
          <div className="container-page max-h-[calc(100dvh-73px)] overflow-y-auto py-4">
            <form
              action="/doctors"
              className="mb-4 flex items-center gap-2 rounded-2xl border border-borderSoft bg-surface p-2"
              role="search"
            >
              <Search className="ms-2 h-4 w-4 text-primary-dark" aria-hidden="true" />
              <label htmlFor="mobile-site-search" className="sr-only">
                ابحث عن طبيب أو اختصاص أو منطقة
              </label>
              <input
                id="mobile-site-search"
                name="q"
                maxLength={120}
                placeholder="ابحث عن طبيب أو اختصاص أو منطقة"
                className="focus-ring h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-sm text-navy placeholder:text-slate-400"
              />
              <button
                type="submit"
                className={buttonStyles({ className: "h-10 min-h-10 px-3" })}
              >
                بحث
              </button>
            </form>

            <nav className="grid gap-2" aria-label="قائمة الهاتف">
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className="rounded-xl px-3 py-3 text-sm font-black text-navy hover:bg-surface"
              >
                الرئيسية
              </Link>

              <p className="px-3 pt-2 text-xs font-black text-slate-400">
                الخدمات
              </p>
              <div className="grid grid-cols-2 gap-2">
                {serviceLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "rounded-xl border p-3 text-sm font-black transition",
                        active
                          ? "border-primary/30 bg-primary-soft text-primary-dark"
                          : "border-borderSoft bg-white text-navy hover:bg-surface"
                      ].join(" ")}
                    >
                      <Icon className="mb-2 h-5 w-5 text-primary-dark" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/offers"
                className="rounded-xl px-3 py-3 text-sm font-black text-navy hover:bg-surface"
              >
                العروض
              </Link>
              <Link
                href="/medical-marketing"
                className="rounded-xl px-3 py-3 text-sm font-black text-navy hover:bg-surface"
              >
                <span className="inline-flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                  التسويق الطبي
                </span>
              </Link>
              <Link
                href="/join"
                className="rounded-xl px-3 py-3 text-sm font-black text-navy hover:bg-surface"
              >
                انضم إلى طب نت
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-surface"
              >
                لوحة الإدارة
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
