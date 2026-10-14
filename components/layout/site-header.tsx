"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  FlaskConical,
  Megaphone,
  Menu,
  Pill,
  Search,
  SmilePlus,
  Sparkles,
  Stethoscope,
  UserPlus,
  X
} from "lucide-react";

import { buttonStyles } from "@/components/ui/button";

const directLinks = [
  { href: "/doctors", label: "الأطباء", icon: Stethoscope },
  { href: "/dentists", label: "الأسنان", icon: SmilePlus },
  { href: "/pharmacies", label: "الصيدليات", icon: Pill },
  { href: "/labs", label: "المختبرات", icon: FlaskConical },
  { href: "/offers", label: "العروض", icon: Sparkles },
  { href: "/medical-marketing", label: "التسويق الطبي", icon: Megaphone }
];

const cosmeticLinks = [
  {
    href: "/cosmetic-doctors",
    label: "أطباء التجميل",
    description: "أطباء التجميل والجراحة التجميلية ضمن الدليل",
    icon: Sparkles
  },
  {
    href: "/cosmetic-centers",
    label: "مراكز التجميل",
    description: "مراكز تجميل طبية مرتبة حسب المحافظة والمنطقة",
    icon: Building2
  }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavLink({
  href,
  label,
  pathname
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "header-nav-link relative inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-[13px] font-black leading-6 transition duration-200",
        active
          ? "bg-primary-soft/90 text-primary-dark"
          : "text-slate-600 hover:bg-slate-50 hover:text-navy"
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCosmeticOpen, setIsCosmeticOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const cosmeticButtonRef = useRef<HTMLButtonElement>(null);
  const cosmeticRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCosmeticOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (document.getElementById("cosmetic-menu")?.contains(document.activeElement)) {
        cosmeticButtonRef.current?.focus();
      } else if (document.getElementById("mobile-main-menu")?.contains(document.activeElement)) {
        menuButtonRef.current?.focus();
      }

      setIsMenuOpen(false);
      setIsCosmeticOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (cosmeticRef.current && !cosmeticRef.current.contains(target)) {
        setIsCosmeticOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setIsMenuOpen(false);
    };

    closeOnDesktop(desktopQuery);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  const cosmeticActive = cosmeticLinks.some((item) => isActivePath(pathname, item.href));

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/80 bg-white/[0.88] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.78]">
      <div className="container-page flex min-h-[72px] items-center gap-4">
        <Link
          href="/"
          className="focus-ring brand-lockup group flex shrink-0 items-center gap-2.5 rounded-2xl"
          aria-label="طب Net - الصفحة الرئيسية"
        >
          <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(145deg,#effdfd,#ffffff)] shadow-[0_10px_30px_rgba(8,121,137,0.13)] ring-1 ring-primary/10 transition duration-300 group-hover:-rotate-2 group-hover:scale-[1.04]">
            <Image
              src="/assets/logo-mark.png"
              alt=""
              width={38}
              height={38}
              className="h-8 w-8 object-contain"
              priority
            />
          </span>
          <Image
            src="/assets/logo-wordmark.png"
            alt="طب Net"
            width={126}
            height={32}
            className="brand-wordmark hidden h-[30px] w-auto object-contain sm:block"
            priority
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex" aria-label="التنقل الرئيسي">
          {directLinks.slice(0, 2).map((item) => (
            <DesktopNavLink key={item.href} href={item.href} label={item.label} pathname={pathname} />
          ))}

          <div ref={cosmeticRef} className="relative">
            <button
              type="button"
              ref={cosmeticButtonRef}
              onClick={() => setIsCosmeticOpen((value) => !value)}
              aria-expanded={isCosmeticOpen}
              aria-controls="cosmetic-menu"
              aria-current={cosmeticActive ? "page" : undefined}
              className={[
                "focus-ring header-nav-link inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-black leading-6 transition duration-200",
                cosmeticActive
                  ? "bg-primary-soft/90 text-primary-dark"
                  : "text-slate-600 hover:bg-slate-50 hover:text-navy"
              ].join(" ")}
            >
              التجميل
              <ChevronDown
                className={`h-3.5 w-3.5 transition duration-300 ${isCosmeticOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {isCosmeticOpen ? (
              <div
                id="cosmetic-menu"
                className="cosmetic-menu-pop absolute right-0 top-[calc(100%+0.7rem)] w-[360px] rounded-[24px] border border-white/90 bg-white/[0.97] p-2.5 shadow-[0_30px_90px_rgba(15,35,64,0.17)] backdrop-blur-2xl"
              >
                <div className="mb-1 px-3 pb-2 pt-1 text-xs font-black text-slate-500">
                  خدمات التجميل الطبية
                </div>
                {cosmeticLinks.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      style={{ animationDelay: `${50 + index * 45}ms` }}
                      className={[
                        "cosmetic-menu-item flex items-start gap-3 rounded-2xl p-3.5 transition duration-200",
                        active ? "bg-primary-soft" : "hover:bg-slate-50"
                      ].join(" ")}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark shadow-[inset_0_0_0_1px_rgba(8,121,137,0.05)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black leading-6 text-navy">{item.label}</span>
                        <span className="mt-0.5 block text-xs font-semibold leading-6 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {directLinks.slice(2).map((item) => (
            <DesktopNavLink key={item.href} href={item.href} label={item.label} pathname={pathname} />
          ))}
        </nav>

        <div className="ms-auto hidden shrink-0 items-center gap-1.5 xl:flex">
          <Link
            href="/doctors"
            className={buttonStyles({
              variant: "ghost",
              className: "h-10 min-h-10 rounded-xl px-3.5 font-black"
            })}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            ابحث
          </Link>

          <Link
            href="/join"
            className={buttonStyles({
              className: "h-10 min-h-10 whitespace-nowrap rounded-xl px-4 font-black"
            })}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            انضم إلينا
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          ref={menuButtonRef}
          aria-controls="mobile-main-menu"
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          className="focus-ring ms-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-borderSoft bg-white/95 text-navy shadow-sm xl:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-main-menu"
          ref={mobileMenuRef}
          onClickCapture={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("a")) setIsMenuOpen(false);
          }}
          onSubmitCapture={() => setIsMenuOpen(false)}
          className="mobile-menu-pop border-t border-borderSoft/70 bg-white/[0.98] backdrop-blur-xl xl:hidden"
        >
          <div className="container-page max-h-[calc(100dvh-72px)] overflow-y-auto py-4">
            <form action="/doctors" className="mb-4 flex items-center gap-2 rounded-2xl border border-borderSoft bg-surface p-2" role="search">
              <Search className="ms-2 h-4 w-4 shrink-0 text-primary-dark" aria-hidden="true" />
              <label htmlFor="mobile-site-search" className="sr-only">ابحث عن طبيب أو اختصاص أو منطقة</label>
              <input
                id="mobile-site-search"
                name="q"
                maxLength={120}
                placeholder="طبيب، اختصاص أو منطقة"
                className="focus-ring h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-sm text-navy placeholder:text-slate-500"
              />
              <button type="submit" className={buttonStyles({ className: "h-10 min-h-10 px-3" })}>بحث</button>
            </form>

            <div className="grid gap-1">
              <Link
                href="/"
                className={[
                  "rounded-xl px-3 py-3 text-sm font-black",
                  pathname === "/" ? "bg-primary-soft text-primary-dark" : "text-slate-700 hover:bg-surface"
                ].join(" ")}
              >
                الرئيسية
              </Link>

              {directLinks.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                    active ? "bg-primary-soft text-primary-dark" : "text-slate-700 hover:bg-surface"
                  ].join(" ")}>
                    <Icon className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <p className="mt-3 px-3 text-xs font-black text-slate-500">التجميل</p>
              {cosmeticLinks.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                    active ? "bg-primary-soft text-primary-dark" : "text-slate-700 hover:bg-surface"
                  ].join(" ")}>
                    <Icon className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <p className="mt-3 px-3 text-xs font-black text-slate-500">المزيد</p>
              {directLinks.slice(2).map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                    active ? "bg-primary-soft text-primary-dark" : "text-slate-700 hover:bg-surface"
                  ].join(" ")}>
                    <Icon className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Link href="/join" className={buttonStyles({ className: "mt-4 w-full" })}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              انضم إلى طب Net
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
