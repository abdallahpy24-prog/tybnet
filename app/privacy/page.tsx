import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | طب نت",
  description: "سياسة الخصوصية الخاصة بمنصة طب نت."
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black text-navy md:text-5xl">
            سياسة الخصوصية
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            توضح هذه السياسة كيف تتعامل منصة طب نت / TibNet مع البيانات التي
            يتم إدخالها أو استخدامها داخل الموقع. باستخدامك للمنصة، فإنك توافق
            على هذه السياسة بالقدر المرتبط باستخدامك للخدمات المتاحة.
          </p>

          <Card className="mt-8 space-y-8 leading-8 text-slate-700">
            <div>
              <h2 className="text-xl font-black text-navy">1. من نحن</h2>
              <p className="mt-2">
                طب نت هي منصة عراقية تهدف إلى تسهيل وصول الزائرين إلى مقدمي
                الخدمات الطبية مثل الأطباء، أطباء الأسنان، الصيدليات، والمختبرات،
                وتسهيل طلب المواعيد أو التواصل معهم.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                2. البيانات التي قد نجمعها
              </h2>
              <p className="mt-2">
                قد نقوم بجمع البيانات التي يرسلها المستخدم عند استخدام نماذج
                الموقع، مثل الاسم، رقم الهاتف، الملاحظات، مقدم الخدمة المطلوب،
                وتاريخ أو وقت الموعد المفضل إن تم إدخاله.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                3. كيف نستخدم البيانات
              </h2>
              <p className="mt-2">
                نستخدم البيانات لغرض متابعة طلبات المواعيد، تسهيل التواصل بين
                المستخدم ومقدم الخدمة، تحسين تجربة استخدام المنصة، وإدارة خدمات
                الموقع والرد على الاستفسارات.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                4. مشاركة البيانات
              </h2>
              <p className="mt-2">
                قد تتم مشاركة بيانات طلب الموعد مع مقدم الخدمة المرتبط بالطلب
                لغرض التواصل أو ترتيب الموعد. لا نبيع بيانات المستخدمين لأطراف
                خارجية.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                5. حماية البيانات
              </h2>
              <p className="mt-2">
                نسعى إلى حماية البيانات باستخدام وسائل تقنية وتنظيمية مناسبة،
                لكن لا توجد وسيلة نقل أو تخزين عبر الإنترنت آمنة بنسبة 100%.
                لذلك ننصح بعدم إرسال معلومات طبية حساسة أو تفصيلية من خلال
                النماذج العامة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                6. البيانات الطبية والحالات الطارئة
              </h2>
              <p className="mt-2">
                لا يُقصد من المنصة أن تكون بديلاً عن الاستشارة الطبية المباشرة،
                ولا يجب استخدامها للحالات الطارئة. في حال وجود حالة طارئة أو
                خطر صحي عاجل، يجب مراجعة أقرب طوارئ أو الاتصال بالجهات المختصة
                فوراً.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                7. الاحتفاظ بالبيانات
              </h2>
              <p className="mt-2">
                قد نحتفظ ببيانات طلبات المواعيد والرسائل للفترة اللازمة لإدارة
                الخدمة، المتابعة، تحسين الأداء، أو لأغراض تنظيمية وإدارية.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                8. تحديث سياسة الخصوصية
              </h2>
              <p className="mt-2">
                قد نقوم بتحديث هذه السياسة من وقت لآخر. عند إجراء تغييرات مهمة،
                سيتم نشر النسخة المحدثة على هذه الصفحة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">9. التواصل معنا</h2>
              <p className="mt-2">
                للاستفسار حول سياسة الخصوصية أو طريقة التعامل مع البيانات، يمكن
                التواصل معنا من خلال صفحة تواصل معنا داخل الموقع.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}