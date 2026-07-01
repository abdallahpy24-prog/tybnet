import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "الشروط والأحكام | طب نت",
  description: "الشروط والأحكام الخاصة باستخدام منصة طب نت."
};

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black text-navy md:text-5xl">
            الشروط والأحكام
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة طب نت /
            TibNet. باستخدامك للموقع، فإنك توافق على الالتزام بهذه الشروط.
          </p>

          <Card className="mt-8 space-y-8 leading-8 text-slate-700">
            <div>
              <h2 className="text-xl font-black text-navy">1. تعريف المنصة</h2>
              <p className="mt-2">
                طب نت هي منصة عراقية تهدف إلى تسهيل وصول المستخدمين إلى مقدمي
                الخدمات الطبية مثل الأطباء، أطباء الأسنان، الصيدليات، والمختبرات،
                وتسهيل طلب المواعيد أو التواصل معهم.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">2. طبيعة الخدمة</h2>
              <p className="mt-2">
                تعمل طب نت كمنصة عرض وربط وتسهيل تواصل، ولا تُعد جهة طبية
                علاجية، ولا تقدم تشخيصاً طبياً، ولا تضمن توفر موعد أو قبول
                مقدم الخدمة لأي طلب يتم إرساله من خلال الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                3. معلومات مقدمي الخدمة
              </h2>
              <p className="mt-2">
                نسعى إلى عرض معلومات دقيقة ومحدثة قدر الإمكان، مثل الاسم،
                الاختصاص، العنوان، أوقات الدوام، ووسائل التواصل. ومع ذلك، قد
                تتغير بعض المعلومات دون إشعار مسبق، لذلك يُنصح المستخدم بالتأكد
                من التفاصيل مباشرة مع مقدم الخدمة قبل الزيارة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">4. طلبات المواعيد</h2>
              <p className="mt-2">
                عند إرسال طلب موعد من خلال الموقع، فإن الطلب يُعد وسيلة للتواصل
                والمتابعة ولا يعني تأكيد الموعد بشكل نهائي إلا بعد التواصل معك
                أو تأكيده من مقدم الخدمة أو الجهة المعنية.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                5. مسؤولية المستخدم
              </h2>
              <p className="mt-2">
                يلتزم المستخدم بإدخال معلومات صحيحة عند استخدام النماذج، وعدم
                استخدام الموقع لأي غرض غير قانوني أو مسيء أو يسبب ضرراً للمنصة
                أو لمقدمي الخدمة أو للمستخدمين الآخرين.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                6. عدم استخدام الموقع للطوارئ
              </h2>
              <p className="mt-2">
                لا يجب استخدام طب نت للحالات الطارئة أو الحالات التي تتطلب
                تدخلاً طبياً عاجلاً. في حالات الطوارئ، يجب مراجعة أقرب طوارئ
                أو الاتصال بالجهات المختصة فوراً.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                7. العروض والمحتوى الإعلاني
              </h2>
              <p className="mt-2">
                قد يعرض الموقع عروضاً أو محتوى ترويجياً مرتبطاً بمقدمي الخدمة.
                تخضع تفاصيل العروض للتوفر وشروط مقدم الخدمة، وقد يتم تعديلها
                أو إيقافها في أي وقت.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                8. حدود المسؤولية
              </h2>
              <p className="mt-2">
                لا تتحمل طب نت المسؤولية عن القرارات الطبية أو العلاجية أو
                جودة الخدمة المقدمة من قبل أي طرف ثالث. العلاقة الطبية أو
                الخدمية تكون بين المستخدم ومقدم الخدمة مباشرة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                9. تعديل الشروط
              </h2>
              <p className="mt-2">
                قد يتم تحديث هذه الشروط والأحكام من وقت لآخر. استمرار استخدامك
                للموقع بعد نشر أي تعديل يعني موافقتك على النسخة المحدثة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">10. التواصل</h2>
              <p className="mt-2">
                لأي استفسار بخصوص هذه الشروط، يمكن التواصل معنا من خلال صفحة
                تواصل معنا داخل الموقع.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}