import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "انضم إلى طب نت | طب نت",
  description:
    "أضف عيادتك أو صيدليتك أو مختبرك إلى منصة طب نت وسهّل وصول الزائرين إلى بياناتك ووسائل التواصل معك."
};

const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;

const benefits = [
  "صفحة منظمة تعرض بياناتك الأساسية بشكل واضح للزائرين.",
  "ظهور ضمن أقسام مخصصة للأطباء، أطباء الأسنان، الصيدليات، أو المختبرات.",
  "تسهيل وصول الزائر إلى موقعك ووسائل التواصل معك.",
  "إمكانية عرض الاختصاص، المنطقة، العنوان، أوقات الدوام، والصور.",
  "استقبال طلبات المواعيد أو الاستفسارات حسب نوع الخدمة المتوفرة.",
  "إمكانية إضافة عروض أو خدمات مرتبطة عند توفرها."
];

const steps = [
  {
    title: "إرسال البيانات الأساسية",
    description:
      "تزوّد فريق طب نت بالاسم، نوع الخدمة، الاختصاص، المحافظة، المنطقة، العنوان، أوقات الدوام، ووسائل التواصل."
  },
  {
    title: "مراجعة وتنظيم الملف",
    description:
      "نراجع البيانات ونعيد ترتيبها بصيغة مناسبة للعرض داخل المنصة، مع طلب أي معلومات ناقصة عند الحاجة."
  },
  {
    title: "النشر والمتابعة",
    description:
      "بعد اكتمال البيانات، يتم نشر الملف ضمن القسم المناسب ليتمكن الزائرون من الوصول إليه بسهولة."
  }
];

const categories = [
  "الأطباء",
  "أطباء الأسنان",
  "الصيدليات",
  "المختبرات الطبية",
  "المراكز والجهات الصحية المناسبة",
  "العروض والخدمات المرتبطة"
];

export default function JoinPage() {
  const whatsappUrl = buildWhatsappUrl(
    contactWhatsapp,
    "مرحباً، أرغب بالانضمام إلى منصة طب نت وإضافة بياناتي أو بيانات مؤسستي داخل الموقع."
  );

  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-primary-dark">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                للأطباء ومقدمي الخدمات الطبية
              </div>

              <h1 className="text-3xl font-black text-navy md:text-5xl">
                اجعل بياناتك الطبية أوضح وأسهل وصولاً
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                طب نت يساعد الأطباء، أطباء الأسنان، الصيدليات، المختبرات،
                والمراكز الصحية على عرض بياناتهم بطريقة منظمة، حتى يتمكن
                الزائر من معرفة موقع الخدمة ووسائل التواصل والتفاصيل الأساسية
                قبل الزيارة أو طلب الموعد.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <Button type="button">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      تواصل للانضمام
                    </Button>
                  </a>
                ) : null}

                <Link href="/contact">
                  <Button type="button" variant="secondary">
                    تواصل مع الفريق
                  </Button>
                </Link>
              </div>
            </div>

            <Card>
              <Rocket className="h-10 w-10 text-primary" aria-hidden="true" />

              <h2 className="mt-4 text-xl font-black text-navy">
                من يمكنه الانضمام؟
              </h2>

              <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600">
                {categories.map((category) => (
                  <div key={category} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{category}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Card>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-black text-navy">
                  لماذا تنضم إلى طب نت؟
                </h2>
              </div>

              <div className="mt-5 grid gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 text-sm leading-7 text-slate-600">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-7 w-7 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-black text-navy">
                  خطوات الإضافة
                </h2>
              </div>

              <div className="mt-5 grid gap-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-borderSoft p-4">
                    <p className="text-xs font-black text-primary-dark">
                      الخطوة {index + 1}
                    </p>
                    <h3 className="mt-1 font-black text-navy">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-black text-navy">
                  جاهز لإضافة بياناتك؟
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  يتم نشر الملفات بعد مراجعة البيانات والتأكد من اكتمالها
                  وملاءمتها لطبيعة المنصة. قد نطلب معلومات إضافية قبل النشر
                  لضمان ظهور الصفحة بشكل واضح ومفيد للزائرين.
                </p>
              </div>

              <div className="shrink-0">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <Button type="button">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      ابدأ الآن
                    </Button>
                  </a>
                ) : (
                  <Link href="/contact">
                    <Button type="button">
                      تواصل معنا
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}