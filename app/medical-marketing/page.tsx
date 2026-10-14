import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Camera,
  CheckCircle2,
  Code2,
  FileText,
  Megaphone,
  MessageCircle,
  Palette,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getSetting } from "@/lib/settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/medical-marketing" },
  title: "التسويق الطبي للأطباء والعيادات في العراق",
  description:
    "خدمات تسويق طبي متكاملة للأطباء والعيادات: استراتيجية وهوية، محتوى وإنتاج بصري، تصوير، حملات رقمية، ومواقع وتطبيقات."
};

const serviceCards = [
  {
    number: "01",
    title: "التصميم والإنتاج البصري",
    kicker: "فريق متخصص بالهوية والإنتاج الطبي",
    description:
      "نبني نظامًا بصريًا متماسكًا يترجم قيمة اسمك بوضوح، من الهوية الأساسية إلى المواد اليومية والحملات.",
    tags: "هوية بصرية • تصميم • ريلز • مونتاج • إنتاج إعلاني",
    icon: Palette
  },
  {
    number: "02",
    title: "كتابة النصوص والمحتوى الطبي",
    kicker: "فريق متخصص بالمحتوى الطبي",
    description:
      "نحوّل خبرتك وخدماتك إلى محتوى واضح وراقي يحافظ على الدقة العلمية ويقدم رسالتك بطريقة سهلة الفهم.",
    tags: "محتوى طبي • نصوص إعلانية • سكربتات • خطة نشر",
    icon: FileText
  },
  {
    number: "03",
    title: "التصوير والإنتاج",
    kicker: "فريق تصوير يفهم بيئة العيادة",
    description:
      "نخطط للمشهد قبل التصوير، وننتج صورًا وفيديوهات تعكس مستوى العيادة باحتراف وبدون مبالغة أو ازدحام بصري.",
    tags: "تصوير طبي • فيديو • ريلز • إخراج • مونتاج",
    icon: Camera
  },
  {
    number: "04",
    title: "الترويج وتحليل السوق",
    kicker: "فريق حملات وقياس أداء",
    description:
      "نحوّل الإعلان إلى خطة محددة الجمهور والرسالة والهدف، مع قياس مستمر للنتائج وتحسين مدروس للأداء.",
    tags: "حملات • استهداف • تحليل • تقارير • تحسين أداء",
    icon: BarChart3
  },
  {
    number: "05",
    title: "المواقع والتطبيقات",
    kicker: "فريق تقني لبناء الحضور الرقمي",
    description:
      "نصمم تجارب رقمية سريعة وراقية للأطباء والعيادات، من صفحة تعريفية احترافية إلى موقع أو منتج رقمي متكامل.",
    tags: "مواقع • تطبيقات • صفحات هبوط • تجربة مستخدم",
    icon: Code2
  }
];

const process = [
  {
    number: "01",
    title: "نفهم علامتك المهنية أولاً",
    description: "نراجع التخصص والخدمات والجمهور والصورة الحالية، ثم نحدد الهدف والرسالة قبل أي تنفيذ."
  },
  {
    number: "02",
    title: "نبني المنظومة",
    description: "هوية ونبرة محتوى ونظام بصري وخطة تصوير ورسائل أساسية تعمل معًا ضمن اتجاه واحد."
  },
  {
    number: "03",
    title: "ننتج ونطلق",
    description: "نحوّل الخطة إلى محتوى وإنتاج وحملات وتجربة رقمية متناسقة عبر جميع نقاط التواصل."
  },
  {
    number: "04",
    title: "نقيس ونطوّر",
    description: "نقرأ النتائج ونحسن ما يحتاج إلى تحسين حتى يبقى الحضور متماسكًا ويتطور بصورة مدروسة."
  }
];

export default async function MedicalMarketingPage() {
  const supportWhatsapp = await getSetting("supportWhatsapp");
  const whatsappUrl = buildWhatsappUrl(
    supportWhatsapp,
    "مرحباً، أرغب بالاستفسار عن خدمات التسويق الطبي من طب نت."
  );

  return (
    <SiteShell>
      <section className="marketing-hero relative isolate overflow-hidden bg-[#071a30] text-white">
        <div className="premium-dark-grid pointer-events-none absolute inset-0 -z-20 opacity-50" />
        <div className="marketing-orb marketing-orb-one" aria-hidden="true" />
        <div className="marketing-orb marketing-orb-two" aria-hidden="true" />

        <div className="container-page relative py-12 md:py-14 lg:py-16 xl:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center xl:gap-14">
            <div>
              <div className="hero-enter hero-enter-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-black text-cyan-200 backdrop-blur-xl md:text-sm">
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                TybNet Medical Marketing
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </div>

              <h1 className="marketing-display hero-enter hero-enter-2 mt-5 max-w-5xl text-[2.7rem] font-black leading-[1.48] tracking-normal sm:text-5xl sm:leading-[1.44] md:text-6xl lg:text-[4.05rem] lg:leading-[1.4] xl:text-[4.45rem]">
                التسويق الطبي
                <span className="marketing-title-accent block">الأقوى في العراق</span>
              </h1>

              <p className="hero-enter hero-enter-3 mt-4 text-xl font-black leading-[1.55] text-white md:text-2xl">
                استراتيجية واضحة. هوية متماسكة. نمو مدروس.
              </p>

              <p className="hero-enter hero-enter-4 mt-4 max-w-3xl text-[15px] font-medium leading-8 text-slate-300 md:text-[17px] md:leading-9">
                نبني للأطباء والعيادات حضورًا رقميًا متكاملًا يجمع الاستراتيجية والهوية والمحتوى والتصوير والحملات والتقنية، ضمن فريق يفهم حساسية المجال الطبي قبل صناعة الرسالة.
              </p>

              <div className="hero-enter hero-enter-5 mt-6 flex flex-wrap gap-3">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ className: "bg-white text-navy hover:bg-cyan-50" })}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    ابدأ مشروعك
                  </a>
                ) : (
                  <Link href="/contact" className={buttonStyles({ className: "bg-white text-navy hover:bg-cyan-50" })}>
                    ابدأ مشروعك
                  </Link>
                )}
                <a href="#services" className={buttonStyles({ variant: "secondary", className: "border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1] hover:text-white" })}>
                  استكشف خدماتنا
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <div className="hero-enter hero-enter-5 mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-400 md:text-sm">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> استراتيجية وهوية</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> إنتاج ومحتوى</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> حملات وتقنية</span>
              </div>
            </div>

            <div className="marketing-visual hero-enter hero-enter-3 relative mx-auto min-h-[460px] w-full max-w-[500px]" aria-hidden="true">
              <div className="absolute inset-8 rounded-[48px] border border-white/10 bg-white/[0.045] shadow-[0_40px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl" />
              <div className="absolute inset-20 rounded-[40px] border border-cyan-200/10 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.14),transparent_62%)]" />

              <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.08] text-cyan-200 shadow-2xl backdrop-blur-2xl">
                <Megaphone className="h-12 w-12" />
              </div>

              {[
                { label: "هوية", icon: Palette, className: "right-2 top-16" },
                { label: "محتوى", icon: FileText, className: "left-0 top-28" },
                { label: "تصوير", icon: Camera, className: "right-2 bottom-24" },
                { label: "تحليل", icon: BarChart3, className: "left-4 bottom-12" },
                { label: "تقنية", icon: Code2, className: "left-1/2 top-3 -translate-x-1/2" }
              ].map(({ label, icon: Icon, className }, index) => (
                <div key={label} className={`marketing-float marketing-float-${index + 1} absolute ${className} flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white shadow-xl backdrop-blur-xl`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><Icon className="h-4 w-4" /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="container-page py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="section-kicker">التسويق الطبي يبدأ من الثقة</p>
              <h2 className="mt-3 text-3xl font-black leading-[1.35] tracking-[-0.02em] text-navy md:text-5xl">
                سمعة الطبيب لا تبنى بإعلان واحد.
              </h2>
            </div>
            <div className="max-w-2xl text-sm font-medium leading-8 text-slate-600 md:text-base lg:justify-self-end">
              <p>
                تبنى من <strong className="text-navy">هوية متماسكة، محتوى موثوق، حضور متسق وتجربة تعكس قيمة التخصص.</strong>
              </p>
              <p className="mt-3">
                لهذا نتعامل مع اسمك كعلامة مهنية لها سمعة ومسؤولية، لا كحساب يحتاج منشورات أكثر.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <section id="services" className="border-y border-borderSoft bg-white py-16 md:py-20" aria-labelledby="marketing-services-heading">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker justify-center">خمسة تخصصات، ضمن فريق واحد</p>
              <h2 id="marketing-services-heading" className="mt-3 text-3xl font-black leading-[1.35] tracking-[-0.02em] text-navy md:text-5xl">
                من الاستراتيجية إلى التقنية، في منظومة واحدة.
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {serviceCards.map((service, index) => {
              const Icon = service.icon;
              return (
                <Reveal key={service.number} delay={(index % 2) * 90} className={index === serviceCards.length - 1 ? "lg:col-span-2" : ""}>
                  <article className="marketing-service-card group relative h-full overflow-hidden rounded-[32px] border border-borderSoft bg-[#fbfdff] p-6 transition duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_28px_80px_rgba(15,35,64,0.09)] md:p-8">
                    <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-primary-soft/80 blur-3xl transition duration-700 group-hover:scale-125" aria-hidden="true" />
                    <div className="relative grid gap-6 sm:grid-cols-[auto_1fr]">
                      <div className="flex sm:flex-col sm:items-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark shadow-[inset_0_0_0_1px_rgba(8,121,137,0.06)]">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="ms-auto text-4xl font-black text-slate-100 sm:ms-0 sm:mt-5">{service.number}</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary-dark">{service.kicker}</p>
                        <h3 className="mt-2 text-2xl font-black text-navy md:text-3xl">{service.title}</h3>
                        <p className="mt-3 text-sm font-medium leading-8 text-slate-600">{service.description}</p>
                        <p className="mt-5 text-xs font-black leading-6 text-slate-500">{service.tags}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="container-page py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="section-kicker">من الفكرة إلى النمو</p>
              <h2 className="mt-3 text-3xl font-black leading-[1.35] tracking-[-0.02em] text-navy md:text-5xl">
                منظومة متكاملة، لا خدمات متفرقة.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-slate-600 md:text-base">
                كل خطوة تكمل ما قبلها، حتى تتحدث الهوية والمحتوى والتصوير والحملات والتجربة الرقمية باللغة نفسها وتخدم الهدف نفسه.
              </p>

              <div className="mt-8 grid gap-3">
                {process.map((item) => (
                  <div key={item.number} className="group flex gap-4 rounded-[26px] border border-transparent bg-surface p-5 transition hover:border-primary/10 hover:bg-white hover:shadow-[0_18px_50px_rgba(15,35,64,0.06)]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy text-xs font-black text-white">{item.number}</span>
                    <div>
                      <h3 className="font-black text-navy">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] bg-[#0b213d] p-7 text-white shadow-[0_30px_90px_rgba(11,33,61,0.18)] md:p-9">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <ShieldCheck className="h-10 w-10 text-cyan-200" aria-hidden="true" />
                <h2 className="display-heading mt-5 text-3xl font-black leading-[1.45]">المجال الطبي يتطلب معيارًا مختلفًا.</h2>
                <p className="mt-4 text-sm font-medium leading-8 text-slate-300">
                  نصنع رسالة قوية من دون التضحية بالدقة أو بصورة الطبيب المهنية. بالنسبة إلينا، التواصل الناجح يجب أن يكون واضحًا وراقيًا ومسؤولًا.
                </p>
                <div className="mt-7 grid gap-3 text-sm font-semibold text-slate-100">
                  {[
                    "لا نختلق شهادات أو خبرات أو نتائج علاجية",
                    "نحافظ على نبرة مهنية تناسب الطبيب والتخصص",
                    "نراجع تناسق الهوية والمحتوى قبل الإطلاق",
                    "نقيس الأداء ونطوّر الحملة بدل تكرار ما لا يعمل"
                  ].map((item) => (
                    <div key={item} className="flex gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="container-page pb-16 md:pb-20">
          <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#eafafa_0%,#f9ffff_45%,#eef3ff_100%)] p-7 text-center md:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl">
              <p className="section-kicker justify-center">جاهز لبناء حضور أقوى؟</p>
              <h2 className="display-heading mt-3 text-3xl font-black leading-[1.45] text-navy md:text-5xl">ابنِ حضورًا يليق باسمك.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-8 text-slate-600 md:text-base">
                حدثنا عن تخصصك وعيادتك والمرحلة التي وصلت إليها، ونرتب لك مسارًا يناسب احتياجك بدل قالب جاهز لا يشبهك.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles()}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> ابدأ معنا
                  </a>
                ) : (
                  <Link href="/contact" className={buttonStyles()}>ابدأ معنا</Link>
                )}
                <Link href="/join" className={buttonStyles({ variant: "secondary" })}>
                  انضم إلى طب Net
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
