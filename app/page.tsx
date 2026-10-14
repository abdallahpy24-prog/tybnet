/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FlaskConical,
  HeartPulse,
  MapPin,
  Megaphone,
  MessageCircle,
  Pill,
  Search,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Stethoscope,
  UserPlus
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { HomeDoctorSearch } from "@/components/public/home-doctor-search";
import { buttonStyles } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getHomeSearchOptions } from "@/lib/queries";
import { getSettingsMap } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "كل الطب في مكان واحد",
  description:
    "طب نت منصة عراقية تجمع الأطباء وأطباء الأسنان والصيدليات والمختبرات وخدمات التجميل، مع بحث حسب المحافظة والاختصاص والمنطقة."
};

export const revalidate = 300;

const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  "https://apps.apple.com/app/id6795167434";
const APP_STORE_BADGE_URL =
  "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const GOOGLE_PLAY_BADGE_URL = "/assets/google-play-badge.png";
const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  "https://play.google.com/store/apps/details?id=com.tybnet.app";

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com"
  ).replace(/\/$/, "");
}

const directoryServices = [
  {
    title: "الأطباء",
    eyebrow: "حسب الاختصاص والموقع",
    description: "ابحث عن الطبيب المناسب حسب الاختصاص والموقع، وراجع معلومات العيادة ووسائل التواصل قبل الزيارة.",
    href: "/doctors",
    icon: Stethoscope,
    className: "lg:col-span-2"
  },
  {
    title: "أطباء الأسنان",
    eyebrow: "رعاية الأسنان",
    description: "اعثر على أطباء الأسنان الأقرب إلى منطقتك بسهولة.",
    href: "/dentists",
    icon: SmilePlus,
    className: ""
  },
  {
    title: "الصيدليات",
    eyebrow: "قريب منك",
    description: "العنوان ووسائل التواصل المتاحة، مرتبة لتصل إليها بسرعة.",
    href: "/pharmacies",
    icon: Pill,
    className: ""
  },
  {
    title: "المختبرات",
    eyebrow: "تحاليل وخدمات",
    description: "مختبرات طبية مرتبة حسب المحافظة والمنطقة والخدمات المتاحة.",
    href: "/labs",
    icon: FlaskConical,
    className: ""
  },
  {
    title: "أطباء التجميل",
    eyebrow: "تجميل وجراحة تجميلية",
    description: "أطباء التجميل والجراحة التجميلية ضمن دليل منظم وواضح.",
    href: "/cosmetic-doctors",
    icon: Sparkles,
    className: ""
  },
  {
    title: "مراكز التجميل",
    eyebrow: "مراكز طبية",
    description: "مراكز تجميل طبية مرتبة حسب موقعك وخدماتها المتاحة.",
    href: "/cosmetic-centers",
    icon: Building2,
    className: "lg:col-span-2"
  }
];

const platformPillars = [
  {
    title: "بحث أدق",
    description: "ابدأ بالمحافظة والاختصاص والمنطقة، ووصل إلى النتائج المناسبة بخطوات واضحة.",
    icon: Search
  },
  {
    title: "معلومات مرتبة",
    description: "العنوان، الاختصاص ووسائل التواصل تظهر في مكان واحد قبل أن تتواصل.",
    icon: BadgeCheck
  },
  {
    title: "وصول مباشر",
    description: "عندما تتوفر بيانات التواصل، تصل إليها مباشرة من صفحة مقدم الخدمة.",
    icon: MessageCircle
  }
];

const legacyHeroDescriptions = new Set([
  "اكتشف الأطباء وأطباء الأسنان وأطباء التجميل ومراكز التجميل والصيدليات والمختبرات، وابحث حسب المحافظة والمنطقة والاختصاص بسهولة.",
  "اختر المحافظة والاختصاص والمنطقة، واطّلع على معلومات العيادة ووسائل التواصل قبل الزيارة.",
  "ابحث عن الأطباء والخدمات الصحية في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على التفاصيل الأساسية قبل التواصل."
]);

export default async function HomePage() {
  const [settings, searchOptions] = await Promise.all([
    getSettingsMap(),
    getHomeSearchOptions()
  ]);

  const configuredHeroDescription = settings.heroDescription?.trim();
  const heroDescription =
    configuredHeroDescription && !legacyHeroDescriptions.has(configuredHeroDescription)
      ? configuredHeroDescription
      : "من الطبيب إلى المختبر والصيدلية وخدمات التجميل الطبية، يجمع طب Net خياراتك الصحية في دليل واحد منظم، لتصل إلى المعلومة المناسبة بسرعة ووضوح.";

  const siteUrl = getSiteUrl();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "طب نت",
    alternateName: "TybNet",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo-mark.png`
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c")
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteJsonLd).replace(/</g, "\\u003c")
        }}
      />

      <section className="premium-hero relative isolate overflow-hidden border-b border-white/70 bg-[#f8fcfd]">
        <div className="hero-grid pointer-events-none absolute inset-0 -z-20 opacity-70" />
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-orb hero-orb-three" aria-hidden="true" />

        <div className="container-page relative py-9 md:py-11 lg:py-12 xl:py-14">
          <div className="grid items-center gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-14">
            <div className="relative z-10 text-center lg:text-start">
              <div className="hero-enter hero-enter-1 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-black text-primary-dark shadow-[0_12px_36px_rgba(8,121,137,0.08)] backdrop-blur-xl md:text-sm">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
                دليلك الصحي العراقي، بصورة أوضح
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" aria-hidden="true" />
              </div>

              <h1 className="hero-display hero-enter hero-enter-2 mx-auto mt-4 max-w-4xl text-balance text-[2.7rem] font-black leading-[1.32] tracking-normal text-navy sm:text-5xl md:text-6xl lg:mx-0 lg:text-[4.05rem] xl:text-[4.6rem]">
                كل الطب
                <span className="hero-title-accent block">في مكان واحد</span>
              </h1>

              <p className="hero-enter hero-enter-3 mx-auto mt-3.5 max-w-2xl text-[15px] font-medium leading-8 text-slate-600 md:text-[17px] md:leading-9 lg:mx-0">
                {heroDescription}
              </p>

              <div className="hero-enter hero-enter-4 mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-black text-slate-500 lg:justify-start md:text-[13px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                  بحث حسب الموقع والاختصاص
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                  معلومات منظمة وقابلة للتحديث
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur">
                  <MapPin className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                  مصمم للعراق
                </span>
              </div>

              <div className="hero-enter hero-enter-5 mx-auto mt-5 max-w-3xl lg:mx-0">
                <HomeDoctorSearch
                  governorates={searchOptions.governorates}
                  specialties={searchOptions.specialties}
                />
              </div>
            </div>

            <div className="hero-enter hero-enter-3 relative mx-auto hidden h-[540px] w-full max-w-[540px] lg:block" aria-hidden="true">
              <div className="health-orbit absolute inset-6 rounded-full border border-primary/10" />
              <div className="health-orbit health-orbit-delay absolute inset-[76px] rounded-full border border-dashed border-primary/15" />

              <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[48px] border border-white/70 bg-white/75 shadow-[0_40px_100px_rgba(11,33,61,0.16)] backdrop-blur-2xl">
                <div className="absolute inset-4 rounded-[40px] bg-[radial-gradient(circle_at_50%_30%,rgba(40,204,201,0.18),transparent_58%)]" />
                <Image src="/assets/logo-mark.png" alt="" width={138} height={138} className="relative h-32 w-32 object-contain drop-shadow-[0_16px_28px_rgba(8,121,137,0.2)]" priority />
              </div>

              <Link href="/doctors" tabIndex={-1} className="floating-health-card floating-health-card-one absolute right-1 top-32 flex w-52 items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(11,33,61,0.12)] backdrop-blur-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-navy">الأطباء</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">اختصاص • محافظة • منطقة</span>
                </span>
              </Link>

              <Link href="/labs" tabIndex={-1} className="floating-health-card floating-health-card-two absolute bottom-24 right-0 flex w-48 items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(11,33,61,0.12)] backdrop-blur-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ff] text-accent">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-navy">المختبرات</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">خدمات أقرب إليك</span>
                </span>
              </Link>

              <Link href="/dentists" tabIndex={-1} className="floating-health-card floating-health-card-three absolute left-0 top-36 flex w-48 items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(11,33,61,0.12)] backdrop-blur-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff3f8] text-[#b64579]">
                  <SmilePlus className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-navy">أطباء الأسنان</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">بحث حسب المنطقة</span>
                </span>
              </Link>

              <Link href="/pharmacies" tabIndex={-1} className="floating-health-card floating-health-card-four absolute bottom-16 left-12 flex w-48 items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(11,33,61,0.12)] backdrop-blur-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#effbf3] text-[#248553]">
                  <Pill className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-navy">الصيدليات</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">عنوان وتواصل</span>
                </span>
              </Link>

              <Link href="/cosmetic-doctors" tabIndex={-1} className="floating-health-card floating-health-card-five absolute left-1/2 top-2 flex w-48 -translate-x-1/2 items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(11,33,61,0.12)] backdrop-blur-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4efff] text-[#7b55c7]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-navy">التجميل</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">أطباء ومراكز</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="container-page pb-10 pt-12 md:pb-12 md:pt-16" aria-labelledby="services-heading">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="section-kicker">دليل طب Net</p>
              <h2 id="services-heading" className="mt-3 text-3xl font-black leading-[1.3] tracking-[-0.02em] text-navy md:text-5xl">
                كل ما تحتاجه للوصول إلى الخدمة الصحية، في واجهة واحدة.
              </h2>
            </div>
            <p className="max-w-2xl text-sm font-medium leading-8 text-slate-600 md:text-base lg:justify-self-end">
              بدل التنقل بين مصادر متفرقة، يرتب طب Net فئات الدليل الصحي ويضع أمامك المعلومات الأساسية قبل الاتصال أو الزيارة.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {directoryServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className={`service-bento group relative min-h-[245px] overflow-hidden rounded-[30px] border border-borderSoft/80 bg-white p-6 shadow-[0_18px_55px_rgba(15,35,64,0.055)] transition duration-500 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_30px_80px_rgba(15,35,64,0.12)] ${service.className}`}
                >
                  <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary-soft/70 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark shadow-[inset_0_0_0_1px_rgba(8,121,137,0.06)] transition duration-500 group-hover:rotate-[-4deg] group-hover:scale-110">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="text-4xl font-black text-slate-100 transition group-hover:text-primary-soft">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-black text-primary-dark">{service.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-black text-navy">{service.title}</h3>
                    <p className="mt-2 max-w-md text-sm font-medium leading-7 text-slate-600">{service.description}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-navy">
                      افتح الدليل
                      <ArrowLeft className="h-4 w-4 transition duration-300 group-hover:-translate-x-1.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="relative overflow-hidden bg-[#091d35] py-14 text-white md:py-16" aria-labelledby="experience-heading">
          <div className="premium-dark-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />
          <div className="container-page relative">
            <div className="grid gap-9 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
              <div>
                <p className="text-sm font-black text-cyan-200">تجربة تختصر الطريق إلى ما تحتاجه</p>
                <h2 id="experience-heading" className="display-heading mt-3 text-3xl font-black leading-[1.45] tracking-normal md:text-5xl">
                  أقل بحث. وصول أوضح.
                </h2>
                <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-300 md:text-base">
                  ابدأ بما تحتاجه ومكانك. بعدها يرتب لك طب Net النتائج والتفاصيل الأساسية في مسار واضح، بلا ازدحام أو خطوات غير ضرورية.
                </p>
                <Link href="/doctors" className={buttonStyles({ className: "mt-7 bg-white text-navy hover:bg-cyan-50" })}>
                  ابدأ من دليل الأطباء
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {platformPillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.title} className="group min-h-[205px] rounded-[28px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white/[0.085]">
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-xs font-black text-white/25">0{index + 1}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-black">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="container-page py-14 md:py-20">
          <div className="app-showcase relative overflow-hidden rounded-[36px] border border-primary/10 bg-[linear-gradient(135deg,#eefbfb_0%,#ffffff_48%,#eef4ff_100%)] p-7 md:p-10 lg:p-12">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-center">
              <div>
                <p className="section-kicker">تطبيق طب Net</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-[1.35] tracking-[-0.02em] text-navy md:text-5xl">
                  دليلك الصحي معك، أينما كنت.
                </h2>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-slate-600 md:text-base">
                  افتح طب Net من هاتفك، وابحث حسب موقعك واحتياجك، وارجع إلى تفاصيل مقدم الخدمة متى احتجتها.
                </p>
                <div className="mt-6 flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 sm:overflow-visible">
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="focus-ring relative inline-flex h-[58px] w-[196px] shrink-0 items-center justify-center overflow-hidden rounded-[11px]" aria-label="تنزيل طب Net من App Store">
                    <img src={APP_STORE_BADGE_URL} alt="Download on the App Store" width={196} height={58} className="block h-[58px] w-[196px] object-fill" decoding="async" />
                  </a>
                  <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="focus-ring relative inline-flex h-[58px] w-[196px] shrink-0 items-center justify-center overflow-hidden rounded-[11px]" aria-label="تنزيل طب Net من Google Play">
                    <img src={GOOGLE_PLAY_BADGE_URL} alt="Get it on Google Play" width={196} height={58} className="block h-[58px] w-[196px] object-fill" decoding="async" />
                  </a>
                </div>
              </div>

              <div className="relative mx-auto h-[390px] w-full max-w-[360px]" aria-hidden="true">
                <div className="phone-card absolute left-1/2 top-0 h-[390px] w-[218px] -translate-x-1/2 rounded-[44px] border-[7px] border-[#0b213d] bg-white p-3 shadow-[0_30px_80px_rgba(11,33,61,0.22)]">
                  <div className="mx-auto h-5 w-24 rounded-b-2xl bg-[#0b213d]" />
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-primary-soft p-3">
                    <Image src="/assets/logo-mark.png" alt="" width={34} height={34} className="h-8 w-8 object-contain" />
                    <div>
                      <p className="text-[11px] font-black text-navy">طب Net</p>
                      <p className="text-[8px] font-bold text-slate-400">كل الطب في مكان واحد</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500"><MapPin className="h-3 w-3 text-primary-dark" /> اختر المحافظة</div>
                    <div className="mt-2 h-7 rounded-xl bg-white shadow-sm" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[Stethoscope, FlaskConical, Pill, SmilePlus].map((Icon, index) => (
                      <div key={index} className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                        <Icon className="mx-auto h-4 w-4 text-primary-dark" />
                        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-100" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-2xl bg-[#0b213d] p-3 text-center text-[9px] font-black text-white">ابدأ البحث</div>
                </div>
                <div className="phone-float phone-float-one absolute -right-1 top-20 rounded-2xl border border-white bg-white/90 px-3 py-2 text-[10px] font-black text-navy shadow-lg backdrop-blur">بحث حسب المنطقة</div>
                <div className="phone-float phone-float-two absolute -left-3 bottom-20 rounded-2xl border border-white bg-white/90 px-3 py-2 text-[10px] font-black text-navy shadow-lg backdrop-blur">تواصل أوضح</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="container-page pb-14 md:pb-20">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-[34px] bg-[#0b213d] p-7 text-white shadow-[0_24px_70px_rgba(11,33,61,0.16)] md:p-9">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <UserPlus className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-6 text-sm font-black text-cyan-200">لمقدمي الخدمات</p>
                <h2 className="mt-2 text-3xl font-black leading-[1.45]">اجعل الوصول إليك أبسط.</h2>
                <p className="mt-3 max-w-xl text-sm leading-8 text-slate-300 md:text-base">
                  اعرض معلوماتك الأساسية وموقعك ووسائل التواصل ضمن تجربة واضحة ومريحة للمستخدم.
                </p>
                <Link href="/join" className={buttonStyles({ className: "mt-6 bg-white text-navy hover:bg-cyan-50" })}>
                  انضم إلى طب Net
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[34px] border border-primary/15 bg-white p-7 shadow-[0_24px_70px_rgba(15,35,64,0.08)] md:p-9">
              <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-soft blur-3xl transition duration-700 group-hover:scale-125" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Megaphone className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-6 text-sm font-black text-primary-dark">التسويق الطبي</p>
                <h2 className="mt-2 text-3xl font-black leading-[1.45] text-navy">حضور رقمي يليق باسمك.</h2>
                <p className="mt-3 max-w-xl text-sm leading-8 text-slate-600 md:text-base">
                  استراتيجية، هوية، محتوى، تصوير وحملات ضمن فريق يفهم حساسية المجال الطبي قبل صناعة الرسالة.
                </p>
                <Link href="/medical-marketing" className={buttonStyles({ variant: "secondary", className: "mt-6" })}>
                  اكتشف التسويق الطبي
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </SiteShell>
  );
}
