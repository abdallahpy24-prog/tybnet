import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "تواصل معنا",
  description:
    "تواصل مع فريق طب نت للاستفسارات، الدعم، تحديث البيانات، أو طلب الانضمام إلى المنصة."
};

const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactPage() {
  const whatsappUrl = buildWhatsappUrl(
    contactWhatsapp,
    "مرحباً، وصلت إلى فريق طب نت عبر الموقع، وأرغب بالتواصل بخصوص استفسار أو طلب إضافة بيانات داخل المنصة."
  );

  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
            <p className="text-sm font-black text-primary-dark">
              الدعم والتواصل
            </p>

            <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
              تواصل مع فريق طب نت
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              يمكنك التواصل معنا للاستفسارات العامة، أو لإضافة بيانات مقدم خدمة وتحديثها، أو لمناقشة فرص التعاون مع طب نت.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card>
              <MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">واتساب المنصة</h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                مناسب للتواصل السريع بخصوص الإضافة، تحديث البيانات، أو متابعة
                الاستفسارات العامة.
              </p>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ className: "mt-5 w-full" })}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  تواصل عبر واتساب
                </a>
              ) : (
                <p className="mt-5 rounded-xl bg-surface p-3 text-xs font-bold leading-6 text-slate-500">
                  التواصل عبر واتساب غير متوفر حالياً. يمكنك استخدام وسائل التواصل الأخرى.
                </p>
              )}
            </Card>

            <Card>
              <Mail className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">البريد الإلكتروني</h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                للمراسلات الرسمية، الشراكات، الملاحظات، أو طلبات تعديل البيانات
                المنشورة داخل الموقع.
              </p>

              {contactEmail ? (
                <a
                  href={"mailto:" + contactEmail}
                  className={buttonStyles({
                    variant: "secondary",
                    className: "mt-5 w-full"
                  })}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {contactEmail}
                </a>
              ) : (
                <p className="mt-5 rounded-xl bg-surface p-3 text-xs font-bold leading-6 text-slate-500">
                  البريد الإلكتروني غير متوفر حالياً. يمكنك استخدام وسائل التواصل الأخرى.
                </p>
              )}
            </Card>

            <Card>
              <UserPlus className="h-8 w-8 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-navy">طلب الانضمام</h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                إذا كنت طبيباً، طبيب أسنان، طبيب تجميل، مركز تجميل، صيدلية، أو مختبراً، يمكنك الاطلاع على تفاصيل الانضمام إلى طب نت.
              </p>

              <Link
                href="/join"
                className={buttonStyles({
                  variant: "secondary",
                  className: "mt-5 w-full"
                })}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                انضم إلى طب نت
              </Link>
            </Card>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card>
              <Clock className="h-8 w-8 text-primary" aria-hidden="true" />

              <h2 className="mt-4 text-xl font-black text-navy">
                متابعة الرسائل
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                تتم متابعة الرسائل والطلبات حسب نوع الاستفسار وأولوية الطلب.
                قد تختلف مدة الرد حسب ضغط الرسائل وحاجة الطلب إلى مراجعة بيانات.
              </p>
            </Card>

            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-navy">
                    تنبيه طبي
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    طب نت دليل للبحث والتواصل مع مقدمي الخدمات الصحية والتجميلية، ولا
                    تستقبل الحالات الطارئة أو تقدم تشخيصاً طبياً. في الحالات
                    الصحية العاجلة، يرجى مراجعة أقرب طوارئ أو مؤسسة صحية فوراً.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}