import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | طب نت",
  description:
    "تعرّف على كيفية تعامل منصة طب نت مع بيانات المستخدمين وطلبات المواعيد ومعلومات التواصل."
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-primary-soft p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <p className="text-sm font-black text-primary-dark">
                  الخصوصية وحماية البيانات
                </p>

                <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
                  سياسة الخصوصية
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                  توضّح هذه السياسة كيف تتعامل منصة طب نت / TibNet مع البيانات
                  التي يتم إدخالها أو استخدامها داخل الموقع، خصوصاً عند البحث
                  عن الخدمات الطبية أو إرسال طلب موعد أو التواصل مع فريق المنصة.
                </p>
              </div>
            </div>
          </div>

          <Card className="mt-8 space-y-8 leading-8 text-slate-700">
            <div>
              <h2 className="text-xl font-black text-navy">1. من نحن</h2>
              <p className="mt-2">
                طب نت هي منصة عراقية تساعد الزائرين على الوصول إلى مقدمي
                الخدمات الطبية مثل الأطباء، أطباء الأسنان، الصيدليات،
                والمختبرات، وتسهّل الاطلاع على بياناتهم أو التواصل معهم أو
                إرسال طلب موعد عند توفر هذه الخدمة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                2. البيانات التي قد نجمعها
              </h2>
              <p className="mt-2">
                قد نقوم بجمع البيانات التي يرسلها المستخدم طوعاً من خلال نماذج
                الموقع، مثل الاسم، رقم الهاتف، الملاحظة، مقدم الخدمة المطلوب،
                والتاريخ أو الوقت المفضل للموعد إن تم إدخاله.
              </p>
              <p className="mt-2">
                قد نستخدم أيضاً بيانات عامة تساعد على تشغيل الموقع وتحسين
                التجربة، مثل نوع الجهاز أو المتصفح أو الصفحات التي يتم التفاعل
                معها، وذلك لأغراض تحسين الأداء وإدارة الخدمة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                3. كيف نستخدم البيانات
              </h2>
              <p className="mt-2">
                نستخدم البيانات لغرض متابعة طلبات المواعيد، تسهيل التواصل بين
                المستخدم ومقدم الخدمة، الرد على الاستفسارات، تحديث البيانات
                المنشورة، تحسين تجربة استخدام المنصة، وإدارة خدمات الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                4. مشاركة البيانات مع مقدمي الخدمة
              </h2>
              <p className="mt-2">
                عند إرسال طلب موعد، قد تتم مشاركة بيانات الطلب مع مقدم الخدمة
                المرتبط به لغرض التواصل معك أو ترتيب الموعد. تتم هذه المشاركة
                بالقدر اللازم لمتابعة الطلب فقط.
              </p>
              <p className="mt-2">
                لا تقوم طب نت ببيع بيانات المستخدمين لأطراف خارجية.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                5. حماية البيانات
              </h2>
              <p className="mt-2">
                نسعى إلى حماية البيانات باستخدام وسائل تقنية وتنظيمية مناسبة،
                لكن لا توجد وسيلة نقل أو تخزين عبر الإنترنت آمنة بنسبة 100%.
                لذلك ننصح بعدم إرسال معلومات طبية حساسة أو تفصيلية أو صور
                تقارير طبية من خلال النماذج العامة داخل الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                6. البيانات الطبية والحالات الطارئة
              </h2>
              <p className="mt-2">
                طب نت لا يقدم تشخيصاً طبياً ولا يستقبل الحالات الطارئة. في حال
                وجود حالة صحية عاجلة أو خطر طبي، يجب مراجعة أقرب طوارئ أو
                مؤسسة صحية أو الاتصال بالجهات المختصة فوراً.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                7. الاحتفاظ بالبيانات
              </h2>
              <p className="mt-2">
                قد نحتفظ ببيانات طلبات المواعيد أو الرسائل للفترة اللازمة
                لإدارة الخدمة، المتابعة، تحسين الأداء، أو لأغراض تنظيمية
                وإدارية. يمكن حذف أو تعديل بعض البيانات عند الطلب متى ما كان
                ذلك ممكناً ومناسباً لطبيعة الخدمة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                8. حقوق المستخدم
              </h2>
              <p className="mt-2">
                يمكن للمستخدم التواصل معنا لطلب الاستفسار عن بياناته، أو طلب
                تعديلها أو حذفها من سجلات المنصة عند الإمكان. قد نحتاج إلى
                التحقق من هوية صاحب الطلب قبل تنفيذ أي تعديل أو حذف.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                9. الروابط الخارجية
              </h2>
              <p className="mt-2">
                قد يحتوي الموقع على روابط خارجية مثل واتساب، إنستغرام، أو
                مواقع تابعة لمقدمي الخدمة. عند انتقالك إلى أي رابط خارجي،
                تخضع لاستخدام وسياسات ذلك الطرف، ولا تتحكم طب نت بطريقة تعامل
                تلك الجهات مع بياناتك.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                10. تحديث سياسة الخصوصية
              </h2>
              <p className="mt-2">
                قد نقوم بتحديث هذه السياسة من وقت لآخر. عند إجراء تغييرات
                مهمة، سيتم نشر النسخة المحدثة على هذه الصفحة، ويُعد استمرار
                استخدام الموقع بعد التحديث قبولاً بالنسخة الجديدة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                11. التواصل معنا
              </h2>
              <p className="mt-2">
                للاستفسار حول سياسة الخصوصية أو طريقة التعامل مع البيانات، يمكن
                التواصل معنا من خلال{" "}
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
                <Link href="/terms" className="text-primary-dark hover:text-primary">
                  الشروط والأحكام
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