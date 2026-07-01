import { FlaskConical, Pill, SmilePlus, Sparkles, Stethoscope } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/lib/queries";
import { getSettingsMap } from "@/lib/settings";

export default async function HomePage() {
  const [settings, homeData] = await Promise.all([
    getSettingsMap(),
    getHomeData()
  ]);

  const stats = [
    { label: "الأطباء", value: homeData.counts.doctors, icon: Stethoscope },
    { label: "أطباء الأسنان", value: homeData.counts.dentists, icon: SmilePlus },
    { label: "الصيدليات", value: homeData.counts.pharmacies, icon: Pill },
    { label: "المختبرات", value: homeData.counts.labs, icon: FlaskConical }
  ];

  return (
    <SiteShell>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-bold text-primary-dark">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            منصة خدمات طبية عراقية
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-navy md:text-6xl">
            {settings.heroTitle || "مرحباً بك في طب نت"}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-600">
            {settings.heroDescription ||
              "منصة عراقية ذكية للتسويق الطبي، تجمع الأطباء وأطباء الأسنان والصيدليات والمختبرات والعروض الطبية في مكان واحد، وتسهّل على المرضى البحث حسب المحافظة والمنطقة والاختصاص مع إمكانية حجز المواعيد بسرعة وسهولة."}
          </p>
        </div>

        <Card className="grid gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
            <p className="text-sm font-bold opacity-90">لوحة بحث سريعة</p>
            <h2 className="mt-2 text-3xl font-black">اختر خدمتك الطبية</h2>
            <p className="mt-3 text-sm leading-7 opacity-90">
              كل النتائج العامة تأتي من قاعدة البيانات وتظهر فقط عند تفعيلها من لوحة الإدارة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-2xl border border-borderSoft bg-surface p-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-2xl font-black text-navy">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}