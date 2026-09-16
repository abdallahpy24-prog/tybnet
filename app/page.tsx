/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  FlaskConical,
  HeartPulse,
  Megaphone,
  MessageCircle,
  Pill,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Stethoscope,
  UserPlus
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { HomeDoctorSearch } from "@/components/public/home-doctor-search";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeData, getHomeSearchOptions } from "@/lib/queries";
import { getSettingsMap } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "دليلك الصحي في العراق",
  description:
    "ابحث عن الأطباء وأطباء الأسنان والصيدليات والمختبرات وخدمات التجميل في العراق حسب المحافظة والاختصاص والمنطقة."
};

export const revalidate = 300;

const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  "https://apps.apple.com/app/id6795167434";
const APP_STORE_BADGE_URL =
  "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const GOOGLE_PLAY_BADGE_URL =
  "https://play.google.com/intl/en_us/badges/static/images/badges/ar_badge_web_generic.png";
const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  "https://play.google.com/store/apps/details?id=com.tybnet.app";

function formatCount(value: number) {
  return new Intl.NumberFormat("ar-IQ").format(value);
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com"
  ).replace(/\/$/, "");
}

export default async function HomePage() {
  const [settings, homeData, searchOptions] = await Promise.all([
    getSettingsMap(),
    getHomeData(),
    getHomeSearchOptions()
  ]);

  const heroTitle =
    settings.heroTitle || "اعثر على الطبيب المناسب في منطقتك";

  const heroDescription =
    settings.heroDescription ||
    "اختر المحافظة والاختصاص والمنطقة، واطّلع على معلومات العيادة ووسائل التواصل قبل الزيارة.";

  const directoryServices = [
    {
      title: "الأطباء",
      description: "بحث حسب الاختصاص والمحافظة والمنطقة",
      href: "/doctors",
      value: homeData.counts.doctors,
      icon: Stethoscope
    },
    {
      title: "أطباء الأسنان",
      description: "عيادات وأطباء أسنان حسب موقعك",
      href: "/dentists",
      value: homeData.counts.dentists,
      icon: SmilePlus
    },
    {
      title: "الصيدليات",
      description: "العناوين ووسائل التواصل المتاحة",
      href: "/pharmacies",
      value: homeData.counts.pharmacies,
      icon: Pill
    },
    {
      title: "المختبرات",
      description: "مختبرات وخدمات تحليل حسب المنطقة",
      href: "/labs",
      value: homeData.counts.labs,
      icon: FlaskConical
    },
    {
      title: "أطباء التجميل",
      description: "أطباء التجميل والجراحة التجميلية",
      href: "/cosmetic-doctors",
      value: homeData.counts.cosmeticDoctors,
      icon: Sparkles
    },
    {
      title: "مراكز التجميل",
      description: "مراكز وخدمات تجميل مدرجة في الدليل",
      href: "/cosmetic-centers",
      value: homeData.counts.cosmeticCenters,
      icon: Building2
    }
  ];

  const siteUrl = getSiteUrl();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "طب نت",
    alternateName: "TybNet",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo.png`
  };
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "طب نت",
    url: siteUrl,
    inLanguage: "ar-IQ",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/doctors?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="relative overflow-hidden border-b border-borderSoft bg-[radial-gradient(circle_at_top_right,rgba(0,169,183,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(30,123,242,0.09),transparent_36%),#f7fcfd]">
        <div className="container-page py-10 md:py-16 lg:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/90 px-4 py-2 text-sm font-black text-primary-dark shadow-sm">
              <HeartPulse className="h-4 w-4" aria-hidden="true" />
              دليل صحي عراقي للبحث والتواصل
            </div>

            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.35] text-navy md:text-5xl lg:text-[3.55rem] lg:leading-[1.25]">
              {heroTitle}
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg md:leading-9">
              {heroDescription}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl">
            <HomeDoctorSearch
              governorates={searchOptions.governorates}
              specialties={searchOptions.specialties}
            />
          </div>

          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-dark" aria-hidden="true" />
              بحث مترابط حسب موقعك واحتياجك
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary-dark" aria-hidden="true" />
              بيانات تواصل منظمة وقابلة للتحديث
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-primary-dark" aria-hidden="true" />
              تواصل مباشر عند توفر الرقم
            </span>
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-14" aria-labelledby="services-heading">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black text-primary-dark">خدمات طب نت</p>
            <h2 id="services-heading" className="mt-2 text-3xl font-black text-navy">
              كل ما تحتاجه للوصول إلى مقدم الخدمة
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            الأعداد أدناه معلومات مساندة محسوبة من السجلات الفعالة، وليست أرقاماً تسويقية تقديرية.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {directoryServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.href}
                href={service.href}
                className="group rounded-2xl border border-borderSoft bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_52px_rgba(16,45,85,0.11)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-black text-slate-500">
                    {formatCount(service.value)} سجل
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black text-navy group-hover:text-primary-dark">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary-dark">
                  استكشف القسم
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-borderSoft bg-white py-10 md:py-14">
        <div className="container-page grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black text-primary-dark">الثقة قبل التواصل</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black leading-[1.4] text-navy">
              معلومة واضحة أهم من واجهة مزدحمة
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
              يعرض طب نت الاختصاص والمنطقة والعنوان وأوقات الدوام ووسائل التواصل عندما تكون متوفرة، مع إبقاء التواصل مع العيادة هو المرجع النهائي للمواعيد والتغييرات اليومية.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "المحور أو المنطقة يظهر منفصلاً عن العنوان التفصيلي",
                "آخر تحقق يعكس مراجعة البيانات وليس تقييماً لجودة العلاج",
                "لا نعرض نقاط التواصل على أنها تقييم أو نجوم",
                "يمكن الإبلاغ عن معلومة تحتاج تصحيحاً من ملف مقدم الخدمة"
              ].map((item) => (
                <div key={item} className="flex gap-2 rounded-xl bg-surface p-3 text-sm font-semibold leading-6 text-slate-600">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-dark" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/medical-disclaimer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary-dark hover:text-primary"
            >
              تعرف على حدود دور طب نت
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <Card className="border-primary/15 bg-[linear-gradient(145deg,#102d55,#0b5263)] p-7 text-white shadow-[0_28px_80px_rgba(16,45,85,0.22)]">
            <p className="text-sm font-black text-cyan-100">للموبايل</p>
            <h2 className="mt-2 text-3xl font-black">خذ طب نت معك</h2>
            <p className="mt-3 text-sm leading-8 text-slate-200">
              استخدم تطبيق طب نت للوصول إلى الدليل من الهاتف بسرعة، مع نفس هدف المنصة: الوصول إلى معلومات مقدم الخدمة والتواصل معه بصورة مباشرة وواضحة.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex min-h-16 items-center justify-center rounded-xl"
                aria-label="تنزيل طب نت من App Store"
              >
                <img
                  src={APP_STORE_BADGE_URL}
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="h-[54px] w-auto"
                  decoding="async"
                />
              </a>

              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex min-h-16 items-center justify-center rounded-xl"
                aria-label="تنزيل طب نت من Google Play"
              >
                <img
                  src={GOOGLE_PLAY_BADGE_URL}
                  alt="احصل عليه من Google Play"
                  width={190}
                  height={60}
                  className="h-[60px] w-auto"
                  decoding="async"
                />
              </a>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-borderSoft bg-primary-soft p-7 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-dark shadow-sm">
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-black text-primary-dark">لمقدمي الخدمات</p>
            <h2 className="mt-2 text-3xl font-black text-navy">أدر حضورك داخل طب نت</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600">
              إذا كنت طبيباً أو تمثل عيادة أو مركز تجميل أو صيدلية أو مختبراً، يمكنك طلب الانضمام أو تحديث بيانات ملف قائم لتكون معلوماتك أوضح للزائر.
            </p>
            <Link
              href="/join"
              className={buttonStyles({ className: "mt-6" })}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              طلب الانضمام
            </Link>
          </div>

          <div className="rounded-3xl border border-borderSoft bg-white p-7 shadow-card md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
              <Megaphone className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-black text-primary-dark">التسويق الطبي</p>
            <h2 className="mt-2 text-3xl font-black text-navy">محتوى احترافي للعيادات والأطباء</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600">
              خدمة مستقلة لمقدمي الخدمات الراغبين بتطوير حضورهم الرقمي، من تخطيط المحتوى إلى التصوير وصناعة الفيديوهات القصيرة بطريقة تناسب المجال الطبي.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5"><Camera className="h-3.5 w-3.5" aria-hidden="true" /> تصوير</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> ريلز ومونتاج</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5"><Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> خطة محتوى</span>
            </div>
            <Link
              href="/medical-marketing"
              className={buttonStyles({ variant: "secondary", className: "mt-6" })}
            >
              تفاصيل خدمة التسويق الطبي
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
