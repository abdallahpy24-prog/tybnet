"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Grid2X2,
  LogIn,
  Menu,
  Search,
  Sparkles,
  Stethoscope,
  UserPlus,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";

const linksBeforeBeauty = [
  {
    href: "/",
    label: "الرئيسية"
  },
  {
    href: "/doctors",
    label: "الأطباء"
  },
  {
    href: "/dentists",
    label: "أطباء الأسنان"
  }
];

const linksAfterBeauty = [
  {
    href: "/pharmacies",
    label: "الصيدليات"
  },
  {
    href: "/labs",
    label: "المختبرات"
  },
  {
    href: "/offers",
    label: "العروض"
  }
];

const beautyLinks = [
  {
    href: "/cosmetic-doctors",
    label: "أطباء التجميل",
    description:
      "ابحث حسب المحافظة والمنطقة والاختصاص",
    icon: Stethoscope
  },
  {
    href: "/cosmetic-centers",
    label: "مراكز التجميل",
    description:
      "ابحث حسب المحافظة والمنطقة واسم المركز",
    icon: Building2
  }
];

const quickLinks = [
  {
    href: "/doctors",
    label: "الأطباء",
    description:
      "ابحث عن طبيب حسب المحافظة أو المنطقة أو الاختصاص"
  },
  {
    href: "/dentists",
    label: "أطباء الأسنان",
    description:
      "استعرض أطباء وعيادات الأسنان حسب موقعك"
  },
  {
    href: "/cosmetic-doctors",
    label: "أطباء التجميل",
    description:
      "أطباء تجميل حسب المحافظة والمنطقة والاختصاص"
  },
  {
    href: "/cosmetic-centers",
    label: "مراكز التجميل",
    description:
      "مراكز وخدمات تجميل حسب المحافظة والمنطقة"
  },
  {
    href: "/pharmacies",
    label: "الصيدليات",
    description:
      "اعثر على صيدليات قريبة واطّلع على وسائل التواصل"
  },
  {
    href: "/labs",
    label: "المختبرات",
    description:
      "مختبرات طبية وخدمات تحليل حسب المحافظة والمنطقة"
  },
  {
    href: "/offers",
    label: "العروض",
    description:
      "تابع العروض الطبية المتاحة عند توفرها"
  },
  {
    href: "/join",
    label: "انضم إلى طب نت",
    description:
      "أضف عيادتك أو مركزك أو صيدليتك أو مختبرك إلى المنصة"
  }
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [isQuickOpen, setIsQuickOpen] =
    useState(false);

  const [isBeautyOpen, setIsBeautyOpen] =
    useState(false);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsQuickOpen(false);
        setIsBeautyOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  function closeAll() {
    setIsMenuOpen(false);
    setIsQuickOpen(false);
    setIsBeautyOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((value) => !value);
    setIsQuickOpen(false);
    setIsBeautyOpen(false);
  }

  function toggleQuickMenu() {
    setIsQuickOpen((value) => !value);
    setIsMenuOpen(false);
    setIsBeautyOpen(false);
  }

  function toggleBeautyMenu() {
    setIsBeautyOpen((value) => !value);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borderSoft bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-[76px] items-center gap-4">
        <Link
          href="/"
          className="flex min-w-max items-center gap-3"
          aria-label="الانتقال إلى الصفحة الرئيسية - طب نت"
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
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="الأقسام الرئيسية"
        >
          {linksBeforeBeauty.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeAll}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-primary-soft hover:text-primary-dark"
            >
              {link.label}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              aria-expanded={isBeautyOpen}
              aria-controls="desktop-beauty-menu"
              onClick={toggleBeautyMenu}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-primary-soft hover:text-primary-dark"
            >
              <Sparkles
                className="h-4 w-4 text-fuchsia-600"
                aria-hidden="true"
              />
              التجميل
              <ChevronDown
                className={[
                  "h-4 w-4 transition",
                  isBeautyOpen
                    ? "rotate-180"
                    : ""
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {isBeautyOpen ? (
              <div
                id="desktop-beauty-menu"
                className="absolute right-1/2 top-[calc(100%+0.75rem)] z-50 w-72 translate-x-1/2 rounded-2xl border border-borderSoft bg-white p-2 shadow-2xl"
              >
                {beautyLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeAll}
                      className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-primary-soft"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                        <Icon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>

                      <span>
                        <span className="block text-sm font-black text-navy">
                          {link.label}
                        </span>

                        <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {linksAfterBeauty.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeAll}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-primary-soft hover:text-primary-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action="/doctors"
          className="hidden max-w-sm flex-1 items-center rounded-2xl border border-borderSoft bg-surface px-3 md:flex"
        >
          <Search
            className="h-4 w-4 text-primary"
            aria-hidden="true"
          />

          <input
            name="q"
            placeholder="ابحث عن طبيب أو اختصاص"
            className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
          />
        </form>

        <Link
          href="/join"
          className="hidden lg:inline-flex"
        >
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-3"
          >
            <UserPlus
              className="h-4 w-4"
              aria-hidden="true"
            />
            انضم للمنصة
          </Button>
        </Link>

        <Link
          href="/login"
          className="hidden sm:inline-flex"
        >
          <Button
            type="button"
            className="h-10 px-3"
          >
            <LogIn
              className="h-4 w-4"
              aria-hidden="true"
            />
            دخول الإدارة
          </Button>
        </Link>

        <button
          type="button"
          className="inline-flex rounded-xl border border-borderSoft bg-white p-2 text-navy lg:hidden"
          aria-label={
            isQuickOpen
              ? "إغلاق الخدمات السريعة"
              : "فتح الخدمات السريعة"
          }
          aria-expanded={isQuickOpen}
          onClick={toggleQuickMenu}
        >
          {isQuickOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Grid2X2 className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          className="inline-flex rounded-xl border border-borderSoft bg-white p-2 text-navy lg:hidden"
          aria-label={
            isMenuOpen
              ? "إغلاق القائمة"
              : "فتح القائمة"
          }
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {isQuickOpen ? (
        <div className="border-t border-borderSoft bg-white lg:hidden">
          <div className="container-page py-4">
            <div className="mb-3">
              <p className="text-sm font-black text-primary-dark">
                الخدمات السريعة
              </p>

              <h2 className="text-xl font-black text-navy">
                اختر القسم المناسب
              </h2>
            </div>

            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-2xl border border-borderSoft bg-surface p-4 transition hover:bg-primary-soft"
                >
                  <p className="text-sm font-black text-navy">
                    {link.label}
                  </p>

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
              <Search
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />

              <input
                name="q"
                placeholder="ابحث عن طبيب أو اختصاص"
                className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
              />

              <Button
                type="submit"
                className="h-9 px-3 text-sm"
              >
                بحث
              </Button>
            </form>

            <nav
              className="grid gap-2"
              aria-label="قائمة الموبايل"
            >
              {linksBeforeBeauty.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-2xl border border-borderSoft bg-surface px-4 py-3 text-sm font-black text-navy transition hover:bg-primary-soft hover:text-primary-dark"
                >
                  {link.label}
                </Link>
              ))}

              <div className="rounded-2xl border border-borderSoft bg-surface">
                <button
                  type="button"
                  aria-expanded={isBeautyOpen}
                  aria-controls="mobile-beauty-menu"
                  onClick={toggleBeautyMenu}
                  className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-black text-navy"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4 text-fuchsia-600"
                      aria-hidden="true"
                    />
                    التجميل
                  </span>

                  <ChevronDown
                    className={[
                      "h-4 w-4 transition",
                      isBeautyOpen
                        ? "rotate-180"
                        : ""
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>

                {isBeautyOpen ? (
                  <div
                    id="mobile-beauty-menu"
                    className="grid gap-2 border-t border-borderSoft p-2"
                  >
                    {beautyLinks.map(
                      (link) => {
                        const Icon = link.icon;

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeAll}
                            className="flex items-center gap-3 rounded-xl bg-white p-3"
                          >
                            <Icon
                              className="h-5 w-5 text-fuchsia-700"
                              aria-hidden="true"
                            />

                            <span className="text-sm font-black text-navy">
                              {link.label}
                            </span>
                          </Link>
                        );
                      }
                    )}
                  </div>
                ) : null}
              </div>

              {linksAfterBeauty.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-2xl border border-borderSoft bg-surface px-4 py-3 text-sm font-black text-navy transition hover:bg-primary-soft hover:text-primary-dark"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/join"
                onClick={closeAll}
                className="rounded-2xl border border-primary-soft bg-primary-soft px-4 py-3 text-sm font-black text-primary-dark transition hover:bg-white"
              >
                انضم إلى طب نت
              </Link>
            </nav>

            <Link
              href="/login"
              onClick={closeAll}
              className="block"
            >
              <Button
                type="button"
                className="h-11 w-full justify-center"
              >
                <LogIn
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                دخول لوحة الإدارة
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}