import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardList, MessageCircle, Rocket, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "انضم إلى طب نت | طب نت",
  description: "انضم إلى منصة طب نت كطبيب أو طبيب أسنان أو صيدلية أو مختبر."
};

const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;

const benefits = [
  "ظهور بياناتك داخل منصة طبية عراقية منظمة.",
  "تسهيل وصول المرضى إلى موقعك ووسائل التواصل معك.",
  "إمكانية عرض الاختصاص، المنطقة، أوقات الدوام، والصور.",
  "استقبال طلبات المواعيد والاستفسارات من الزائرين.",
  "إمكانية إضافة العروض والخدمات الخاصة حسب نوع الحساب."
];

const steps = [
  {
    title: "إرسال البيانات",
    description: "تزوّد فريق طب نت بالاسم، الاختصاص، العنوان، أوقات الدوام، ووسائل التواصل."
  },
  {
    title: "مراجعة وتنظيم الصفحة",
    description: "يقوم الفريق بمراجعة البيانات وترتيبها بالشكل المناسب داخل المنصة."
  },
  {
    title: "النشر داخل الموقع",
    description: "بعد التأكد من المعلومات، يتم نشر الصفحة لتظهر للزائرين ضمن القسم المناسب."
  }
];

export default function JoinPage() {
  const whatsappUrl = buildWhatsappUrl(
    contactWhatsapp,
    "مرحبا، أرغب بالانضمام إلى منصة طب نت وإضافة بياناتي داخل الموقع."
  );

  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
              <p className="text-sm font-black text-primary-dark">للأطباء والمراكز الطبية</p>
              <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
                انضم إلى طب نت
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                إذا كنت طبيباً، طبيب أسنان، صيدلية، مختبراً، أو مركزاً صحياً،
                يمكنك إضافة بياناتك إلى طب نت لتسهيل وصول المرضى إليك وتنظيم
                حضورك الرقمي داخل المنصة.
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
                    صفحة التواصل
                  </Button>
                </Link>
              </div>
            </div>

            <Card>
              <Rocket className="h-10 w-10 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-navy">ماذا يمكن إضافته؟</h2>
              <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600">
                <p>الأطباء</p>
                <p>أطباء الأسنان</p>
                <p>الصيدليات</p>
                <p>المختبرات</p>
                <p>العروض والخدمات المرتبطة</p>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Card>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-black text-navy">فوائد الانضمام</h2>
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
                <h2 className="text-xl font-black text-navy">خطوات الإضافة</h2>
              </div>

              <div className="mt-5 grid gap-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-borderSoft p-4">
                    <p className="text-xs font-black text-primary-dark">الخطوة {index + 1}</p>
                    <h3 className="mt-1 font-black text-navy">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-8">
            <h2 className="text-xl font-black text-navy">تنبيه تنظيمي</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              قبول الإضافة أو النشر داخل طب نت يخضع لمراجعة بيانات مقدم الخدمة
              ومدى ملاءمتها للمنصة. قد يتم طلب معلومات إضافية أو تحديث بعض
              البيانات قبل النشر.
            </p>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}