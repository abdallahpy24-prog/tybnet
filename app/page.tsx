import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  FlaskConical,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Stethoscope,
  UserPlus
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/lib/queries";
import { getSettingsMap } from "@/lib/settings";

export default async function HomePage() {
  const [settings, homeData] = await Promise.all([
    getSettingsMap(),
    getHomeData()
  ]);

  const stats = [
    {
      label: "الأطباء",
      value: homeData.counts.doctors,
      icon: Stethoscope,
      href: "/doctors"
    },
    {
      label: "أطباء الأسنان",
      value: homeData.counts.dentists,
      icon: SmilePlus,
      href: "/dentists"
    },
    {
      label: "الصيدليات",
      value: homeData.counts.pharmacies,
      icon: Pill,
      href: "/pharmacies"
    },
    {
      label: "المختبرات",
      value: homeData.counts.labs,
      icon: FlaskConical,
      href: "/labs"
    }
  ];

  const services = [
    {
      title: "ابحث حسب المحافظة والمنطقة",
      description: "صفّي النتائج حسب موقعك حتى تصل إلى مقدم خدمة مناسب وقريب منك.",
      icon: MapPin
    },
    {
      title: "راجع التفاصيل قبل التواصل",
      description: "اطّلع على الاختصاص، العنوان، أوقات الدوام، ووسائل التواصل المتاحة.",
      icon: Search
    },
    {
      title: "أرسل طلب موعد بسهولة",
      description: "استخدم نموذج طلب الموعد أو تواصل مباشرة عبر واتساب عند توفره.",
      icon: CalendarCheck
    }
  ];

  const heroTitle =
    settings.heroTitle ||
    "طريقك الأسرع للوصول إلى الخدمات الطبية في العراق";

  const heroDescription =
    settings.heroDescription ||
    "طب نت منصة عراقية تنظّم بيانات الأطباء وأطباء الأسنان والصيدليات والمختبرات، وتساعدك على البحث حسب المحافظة والمنطقة والاختصاص، مع إمكانية التواصل أو طلب موعد بسهولة.";

  return (
    <SiteShell>
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-black text-primary-dark">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              منصة عراقية للخدمات الطبية
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.35] text-navy md:text-5xl md:leading-[1.35] lg:text-6xl lg:leading-[1.3]">
              {heroTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg md:leading-9">
              {heroDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/doctors">
                <Button type="button">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  ابحث عن طبيب
                </Button>
              </Link>

              <Link href="/join">
                <Button type="button" variant="secondary">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  انضم إلى طب نت
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-sm font-bold text-slate-500 sm:flex-row sm:flex-wrap">
              <span>أطباء</span>
              <span className="hidden sm:inline">•</span>
              <span>أطباء أسنان</span>
              <span className="hidden sm:inline">•</span>
              <span>صيدليات</span>
              <span className="hidden sm:inline">•</span>
              <span>مختبرات</span>
              <span className="hidden sm:inline">•</span>
              <span>عروض طبية</span>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
              <p className="text-sm font-bold opacity-90">ابدأ من هنا</p>
              <h2 className="mt-2 text-3xl font-black">
                اختر نوع الخدمة التي تبحث عنها
              </h2>
              <p className="mt-3 text-sm leading-7 opacity-90">
                النتائج تظهر من قاعدة بيانات طب نت بعد تفعيلها من لوحة الإدارة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="rounded-2xl border border-borderSoft bg-surface p-4 transition hover:border-primary-soft hover:bg-primary-soft"
                  >
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    <p className="mt-3 text-3xl font-black text-navy">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold text-slate-500">
                      {stat.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Card key={service.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <h2 className="mt-4 text-xl font-black text-navy">
                  {service.title}
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Card>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="text-2xl font-black text-navy">
                معلومات أوضح قبل قرار الزيارة
              </h2>
            </div>

            <p className="mt-4 text-sm leading-8 text-slate-600">
              يساعدك طب نت على مراجعة البيانات الأساسية لمقدم الخدمة قبل
              التواصل، مثل الاختصاص، المنطقة، العنوان، أوقات الدوام، والصور
              المتاحة. ننصح دائماً بالتأكد من التفاصيل مباشرة قبل الزيارة.
            </p>

            <Link
              href="/medical-disclaimer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary-dark transition hover:text-primary"
            >
              اقرأ إخلاء المسؤولية الطبية
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>

          <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
            <p className="text-sm font-black text-primary-dark">
              لأصحاب العيادات والمراكز
            </p>

            <h2 className="mt-3 text-3xl font-black text-navy">
              تريد تظهر داخل طب نت؟
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600">
              إذا كنت طبيباً، طبيب أسنان، صيدلية، مختبراً، أو مركزاً صحياً،
              يمكنك طلب إضافة بياناتك داخل المنصة حتى يصل إليك الزائرون بشكل
              أسهل وأكثر تنظيماً.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/join">
                <Button type="button">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  انضم إلى طب نت
                </Button>
              </Link>

              <Link href="/contact">
                <Button type="button" variant="secondary">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}