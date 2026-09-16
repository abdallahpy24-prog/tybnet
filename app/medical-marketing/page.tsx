import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clapperboard,
  FileText,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSetting } from "@/lib/settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/medical-marketing" },
  title: "التسويق الطبي",
  description:
    "خدمة التسويق الطبي من طب نت للأطباء والعيادات: تخطيط محتوى، تصوير، ريلز ومونتاج مع مراعاة وضوح الرسالة المهنية وعدم تقديم ادعاءات طبية غير موثقة."
};

const serviceCards = [
  {
    title: "خطة محتوى",
    description:
      "تحويل أهداف العيادة ومواضيعها إلى أفكار واضحة قابلة للتصوير والنشر، مع تنظيم الرسائل بدل النشر العشوائي.",
    icon: FileText
  },
  {
    title: "تصوير داخل العيادة",
    description:
      "تحضير المشاهد والإضاءة والزوايا بما يحافظ على مظهر مهني مناسب للطبيب والمكان.",
    icon: Camera
  },
  {
    title: "ريلز ومونتاج",
    description:
      "فيديوهات قصيرة سريعة وواضحة، مع عناوين ونصوص على الشاشة وإيقاع يناسب المنصات الاجتماعية.",
    icon: Clapperboard
  },
  {
    title: "هوية الرسالة",
    description:
      "توحيد طريقة عرض الطبيب وخدمات العيادة حتى يكون المحتوى متماسكاً ويسهل تذكره.",
    icon: Sparkles
  }
];

export default async function MedicalMarketingPage() {
  const supportWhatsapp = await getSetting("supportWhatsapp");
  const whatsappUrl = buildWhatsappUrl(
    supportWhatsapp,
    "مرحباً، أرغب بالاستفسار عن خدمة التسويق الطبي من طب نت."
  );

  return (
    <SiteShell>
      <section className="border-b border-borderSoft bg-[radial-gradient(circle_at_top_right,rgba(0,169,183,0.14),transparent_42%),#f7fcfd]">
        <div className="container-page py-12 md:py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-primary-dark shadow-sm">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              خدمة لمقدمي الخدمات الصحية
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.35] text-navy md:text-5xl">
              تسويق طبي يشرح القيمة بوضوح، لا بضجيج أكثر
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-9 text-slate-600 md:text-lg">
              نساعد الطبيب أو العيادة على بناء محتوى مرئي منظم: نحدد الفكرة، نحضر للتصوير، نصنع الفيديو القصير، ونرتب الرسالة بما يناسب المجال الطبي ويحافظ على الوضوح والمهنية.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles()}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  استفسر عبر واتساب
                </a>
              ) : (
                <Link href="/contact" className={buttonStyles()}>
                  تواصل معنا
                </Link>
              )}
              <Link
                href="/join"
                className={buttonStyles({ variant: "secondary" })}
              >
                لديك ملف في طب نت؟ ابدأ من هنا
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {serviceCards.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
                  <Icon className="h-5 w-5" aria-hidden="true" />
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

      <section className="border-y border-borderSoft bg-white py-10 md:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black text-primary-dark">طريقة العمل</p>
            <h2 className="mt-2 text-3xl font-black text-navy">
              مسار واضح من الفكرة إلى النشر
            </h2>
            <div className="mt-6 grid gap-3">
              {[
                ["1", "فهم العيادة والجمهور", "نحدد الخدمات والمواضيع التي تحتاج شرحاً فعلياً وما الذي يجب تجنبه."],
                ["2", "تحضير يوم التصوير", "نرتب الأفكار والنصوص واللقطات قبل تشغيل الكاميرا لتقليل الوقت والارتجال."],
                ["3", "الإنتاج والمراجعة", "مونتاج مختصر، نصوص واضحة، ومراجعة الرسالة قبل التسليم."],
                ["4", "تكرار ما ينجح", "نبني الدفعات التالية على المحتوى الذي كان أوضح وأكثر فائدة للجمهور."]
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-4 rounded-2xl bg-surface p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-black text-white">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-black text-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-navy p-7 text-white md:p-8">
            <ShieldCheck className="h-9 w-9 text-cyan-200" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black">المحتوى الطبي يحتاج حدوداً واضحة</h2>
            <p className="mt-4 text-sm leading-8 text-slate-200">
              التسويق لا يبرر ادعاءات علاجية غير مثبتة، ولا ضمان نتائج، ولا استخدام معلومات مرضى دون إذن مناسب. هدفنا تقديم محتوى مهني مفهوم يحترم طبيعة المجال الصحي.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-100">
              {[
                "لا نختلق شهادات أو خبرات أو نتائج علاجية",
                "نفضل شرح الخدمة والفائدة المتوقعة بلغة دقيقة",
                "موافقة صاحب المحتوى مطلوبة قبل استخدام صوره أو مادته",
                "الرسالة التسويقية لا تحل محل الاستشارة الطبية"
              ].map((item) => (
                <div key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
