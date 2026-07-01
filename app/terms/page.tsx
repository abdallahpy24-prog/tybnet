import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "الشروط والأحكام | طب نت",
  description:
    "الشروط والأحكام الخاصة باستخدام منصة طب نت والبحث عن مقدمي الخدمات الطبية والتواصل معهم."
};

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <p className="text-sm font-black text-primary-dark">
                  شروط استخدام المنصة
                </p>

                <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
                  الشروط والأحكام
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                  توضّح هذه الشروط القواعد العامة لاستخدام منصة طب نت / TibNet.
                  باستخدامك للموقع أو إرسال أي طلب من خلاله، فإنك توافق على
                  الالتزام بهذه الشروط بالقدر المرتبط باستخدامك للخدمات المتاحة.
                </p>
              </div>
            </div>
          </div>

          <Card className="mt-8 space-y-8 leading-8 text-slate-700">
            <div>
              <h2 className="text-xl font-black text-navy">1. تعريف المنصة</h2>
              <p className="mt-2">
                طب نت هي منصة عراقية تساعد المستخدمين على الوصول إلى مقدمي
                الخدمات الطبية مثل الأطباء، أطباء الأسنان، الصيدليات،
                المختبرات، والمراكز الصحية المناسبة، وتسهّل الاطلاع على
                بياناتهم أو التواصل معهم أو إرسال طلب موعد عند توفر هذه الخدمة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">2. طبيعة الخدمة</h2>
              <p className="mt-2">
                تعمل طب نت كمنصة عرض وبحث وتواصل، ولا تُعد جهة طبية علاجية،
                ولا تقدم تشخيصاً طبياً، ولا تصدر وصفات علاجية، ولا تمارس أي
                عمل طبي مباشر.
              </p>
              <p className="mt-2">
                دور المنصة يقتصر على تنظيم عرض البيانات وتسهيل وصول المستخدم
                إلى مقدم الخدمة أو وسائل التواصل المتاحة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                3. معلومات مقدمي الخدمة
              </h2>
              <p className="mt-2">
                نسعى إلى عرض معلومات دقيقة ومحدثة قدر الإمكان، مثل الاسم،
                الاختصاص، المحافظة، المنطقة، العنوان، أوقات الدوام، الصور،
                ووسائل التواصل. ومع ذلك، قد تتغير بعض المعلومات دون إشعار
                مسبق.
              </p>
              <p className="mt-2">
                لذلك يُنصح المستخدم بالتأكد من التفاصيل مباشرة مع مقدم الخدمة
                قبل الحجز أو الزيارة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">4. طلبات المواعيد</h2>
              <p className="mt-2">
                عند إرسال طلب موعد من خلال الموقع، فإن الطلب يُعد وسيلة
                للتواصل والمتابعة فقط، ولا يعني تأكيد الموعد بشكل نهائي.
              </p>
              <p className="mt-2">
                يتم تأكيد الموعد، إن توفر، من خلال التواصل معك أو من خلال مقدم
                الخدمة أو الجهة المعنية مباشرة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                5. مسؤولية المستخدم
              </h2>
              <p className="mt-2">
                يلتزم المستخدم بإدخال معلومات صحيحة عند استخدام نماذج الموقع،
                وعدم إرسال بيانات مضللة أو مسيئة أو غير مرتبطة بطبيعة الخدمة.
              </p>
              <p className="mt-2">
                كما يلتزم المستخدم بعدم استخدام الموقع لأي غرض غير قانوني أو
                يسبب ضرراً للمنصة أو لمقدمي الخدمة أو للمستخدمين الآخرين.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                6. عدم استخدام المنصة للطوارئ
              </h2>
              <p className="mt-2">
                لا يجب استخدام طب نت للحالات الطارئة أو الحالات التي تتطلب
                تدخلاً طبياً عاجلاً. في حالات الطوارئ، يجب مراجعة أقرب طوارئ
                أو مؤسسة صحية أو الاتصال بالجهات المختصة فوراً.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                7. العروض والمحتوى الترويجي
              </h2>
              <p className="mt-2">
                قد يعرض الموقع عروضاً أو محتوى ترويجياً مرتبطاً بمقدمي الخدمة.
                تخضع تفاصيل العروض للتوفر وشروط مقدم الخدمة، وقد يتم تعديلها
                أو إيقافها في أي وقت.
              </p>
              <p className="mt-2">
                يُنصح المستخدم بالتأكد من تفاصيل أي عرض مباشرة قبل الحجز أو
                الاستفادة منه.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                8. الانضمام إلى المنصة
              </h2>
              <p className="mt-2">
                يمكن لمقدمي الخدمات الطبية طلب إضافة بياناتهم إلى طب نت، لكن
                قبول الإضافة أو النشر يخضع لمراجعة البيانات ومدى ملاءمتها
                لطبيعة المنصة.
              </p>
              <p className="mt-2">
                قد تطلب طب نت معلومات إضافية أو تحديث بعض البيانات قبل النشر
                لضمان وضوح الملف وفائدته للزائرين.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                9. حدود المسؤولية
              </h2>
              <p className="mt-2">
                لا تتحمل طب نت المسؤولية عن القرارات الطبية أو العلاجية أو
                جودة الخدمة المقدمة من قبل أي طرف ثالث. العلاقة الطبية أو
                الخدمية تكون مباشرة بين المستخدم ومقدم الخدمة.
              </p>
              <p className="mt-2">
                كما لا تضمن المنصة توفر موعد، أو استمرار توفر خدمة معينة، أو
                دقة الأسعار والعروض وأوقات الدوام في كل وقت.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                10. الروابط الخارجية
              </h2>
              <p className="mt-2">
                قد يحتوي الموقع على روابط خارجية مثل واتساب، إنستغرام، أو
                صفحات ومواقع تابعة لمقدمي الخدمة. عند استخدامك لأي رابط خارجي،
                فإنك تخضع لشروط وسياسات ذلك الطرف.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                11. تعديل الشروط
              </h2>
              <p className="mt-2">
                قد يتم تحديث هذه الشروط والأحكام من وقت لآخر. استمرار استخدامك
                للموقع بعد نشر أي تعديل يعني موافقتك على النسخة المحدثة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">12. التواصل</h2>
              <p className="mt-2">
                لأي استفسار بخصوص هذه الشروط، يمكن التواصل معنا من خلال{" "}
                <Link
                  href="/contact"
                  className="font-black text-primary-dark hover:text-primary"
                >
                  صفحة تواصل معنا
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-primary-soft bg-surface p-5">
              <h2 className="text-lg font-black text-navy">روابط مرتبطة</h2>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                <Link href="/privacy" className="text-primary-dark hover:text-primary">
                  سياسة الخصوصية
                </Link>
                <Link
                  href="/medical-disclaimer"
                  className="text-primary-dark hover:text-primary"
                >
                  إخلاء المسؤولية الطبية
                </Link>
                <Link href="/contact" className="text-primary-dark hover:text-primary">
                  تواصل معنا
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}