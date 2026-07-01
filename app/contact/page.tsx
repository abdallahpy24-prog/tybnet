import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "تواصل معنا | طب نت",
  description: "تواصل مع فريق منصة طب نت للاستفسارات والدعم وإضافة مقدمي الخدمات."
};

const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactPage() {
  const whatsappUrl = buildWhatsappUrl(
    contactWhatsapp,
    "مرحبا، وصلت لكم من موقع طب نت وأرغب بالتواصل مع فريق المنصة."
  );

  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
            <h1 className="text-3xl font-black text-navy md:text-5xl">
              تواصل معنا
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              نسعد بتواصلك مع فريق طب نت للاستفسارات، الدعم، إضافة العيادات
              والمراكز، أو تحديث بيانات مقدمي الخدمات داخل المنصة.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card>
              <MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">واتساب</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                للتواصل السريع مع فريق المنصة بخصوص الإضافة أو الدعم أو تحديث
                البيانات.
              </p>

              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 block">
                  <Button type="button" className="w-full">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    تواصل عبر واتساب
                  </Button>
                </a>
              ) : (
                <p className="mt-5 rounded-xl bg-surface p-3 text-xs font-bold text-slate-500">
                  سيتم إضافة رقم واتساب المنصة قريباً.
                </p>
              )}
            </Card>

            <Card>
              <Mail className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">البريد الإلكتروني</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                يمكن استخدام البريد للمراسلات الرسمية، الشراكات، أو طلبات
                تعديل البيانات.
              </p>

              {contactEmail ? (
                <a href={"mailto:" + contactEmail} className="mt-5 block">
                  <Button type="button" variant="secondary" className="w-full">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {contactEmail}
                  </Button>
                </a>
              ) : (
                <p className="mt-5 rounded-xl bg-surface p-3 text-xs font-bold text-slate-500">
                  سيتم إضافة البريد الرسمي قريباً.
                </p>
              )}
            </Card>

            <Card>
              <Clock className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">أوقات المتابعة</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                تتم متابعة الرسائل والطلبات حسب أولوية الطلب ونوع الاستفسار،
                وقد تختلف مدة الرد حسب ضغط الطلبات.
              </p>
              <p className="mt-5 rounded-xl bg-surface p-3 text-xs font-bold text-slate-500">
                للحالات الطبية الطارئة، يرجى مراجعة أقرب طوارئ فوراً.
              </p>
            </Card>
          </div>

          <Card className="mt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-xl font-black text-navy">ملاحظة مهمة</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  طب نت منصة لتسهيل الوصول إلى مقدمي الخدمات الطبية ولا تستقبل
                  الحالات الطارئة أو تقدم تشخيصاً طبياً. إذا كانت لديك حالة
                  صحية عاجلة، راجع أقرب مؤسسة طبية أو طوارئ مباشرة.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}