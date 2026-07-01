"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid2X2, LogIn, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/doctors", label: "الأطباء" },
  { href: "/dentists", label: "أطباء الأسنان" },
  { href: "/pharmacies", label: "الصيدليات" },
  { href: "/labs", label: "المختبرات" },
  { href: "/offers", label: "العروض" }
];

const quickLinks = [
  { href: "/doctors", label: "الأطباء", description: "ابحث عن طبيب حسب المحافظة والاختصاص" },
  { href: "/dentists", label: "أطباء الأسنان", description: "عيادات وأطباء أسنان قريبين منك" },
  { href: "/pharmacies", label: "الصيدليات", description: "صيدليات حسب المحافظة والمنطقة" },
  { href: "/labs", label: "المختبرات", description: "مختبرات وتحاليل طبية" },
  { href: "/offers", label: "العروض", description: "العروض الطبية المتاحة" }
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  function closeAll() {
    setIsMenuOpen(false);
    setIsQuickOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((value) => !value);
    setIsQuickOpen(false);
  }

  function toggleQuickMenu() {
    setIsQuickOpen((value) => !value);
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borderSoft bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-[76px] items-center gap-4">
        <Link
          href="/"
          className="flex min-w-max items-center gap-3"
          aria-label="طب نت"
          onClick={closeAll}
        >
          <Image
            src="/assets/logo.png"
            alt="طب نت"
            width={54}
            height={52}
            className="h-12 w-12 object-contain"
            priority
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-2 lg:flex"
          aria-label="الأقسام الرئيسية"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-primary-soft hover:text-primary-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action="/doctors"
          className="hidden max-w-sm flex-1 items-center rounded-2xl border border-borderSoft bg-surface px-3 md:flex"
        >
          <Search className="h-4 w-4 text-primary" aria-hidden="true" />
          <input
            name="q"
            placeholder="ابحث عن طبيب أو اختصاص"
            className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
          />
        </form>

        <Link href="/login" className="hidden sm:inline-flex">
          <Button type="button" className="h-10 px-3">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            دخول
          </Button>
        </Link>

        <button
          type="button"
          className="inline-flex rounded-xl border border-borderSoft bg-white p-2 text-navy lg:hidden"
          aria-label={isQuickOpen ? "إغلاق الخدمات السريعة" : "فتح الخدمات السريعة"}
          aria-expanded={isQuickOpen}
          onClick={toggleQuickMenu}
        >
          {isQuickOpen ? <X className="h-5 w-5" /> : <Grid2X2 className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="inline-flex rounded-xl border border-borderSoft bg-white p-2 text-navy lg:hidden"
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isQuickOpen ? (
        <div className="border-t border-borderSoft bg-white lg:hidden">
          <div className="container-page py-4">
            <div className="mb-3">
              <p className="text-sm font-black text-primary-dark">الخدمات السريعة</p>
              <h2 className="text-xl font-black text-navy">شنو تبحث؟</h2>
            </div>

            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-2xl border border-borderSoft bg-surface p-4 transition hover:bg-primary-soft"
                >
                  <p className="text-sm font-black text-navy">{link.label}</p>
                  <p className="mt-1 text-xs font-bold leading-6 text-slate-500">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isMenuOpen ? (
        <div className="border-t border-borderSoft bg-white lg:hidden">
          <div className="container-page space-y-4 py-4">
            <form
              action="/doctors"
              className="flex items-center rounded-2xl border border-borderSoft bg-surface px-3"
            >
              <Search className="h-4 w-4 text-primary" aria-hidden="true" />
              <input
                name="q"
                placeholder="ابحث عن طبيب أو اختصاص"
                className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <Button type="submit" className="h-9 px-3 text-sm">
                بحث
              </Button>
            </form>

            <nav className="grid gap-2" aria-label="قائمة الموبايل">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-2xl border border-borderSoft bg-surface px-4 py-3 text-sm font-black text-navy transition hover:bg-primary-soft hover:text-primary-dark"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/login" onClick={closeAll} className="block">
              <Button type="button" className="h-11 w-full justify-center">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                دخول / لوحة الإدارة
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}