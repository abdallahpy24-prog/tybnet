import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "إخلاء المسؤولية الطبية | طب نت",
  description: "إخلاء المسؤولية الطبية الخاص بمنصة طب نت."
};

export default function MedicalDisclaimerPage() {
  return (
    <SiteShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-primary-soft p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                <AlertTriangle className="h-7 w-7" aria-hidden="true" />
              </div>

              <div>
                <h1 className="text-3xl font-black text-navy md:text-5xl">
                  إخلاء المسؤولية الطبية
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  هذه الصفحة توضّح حدود دور منصة طب نت فيما يتعلق بالمعلومات
                  والخدمات الطبية المعروضة داخل الموقع.
                </p>
              </div>
            </div>
          </div>

          <Card className="mt-8 space-y-8 leading-8 text-slate-700">
            <div>
              <h2 className="text-xl font-black text-navy">
                1. طب نت ليست جهة طبية علاجية
              </h2>
              <p className="mt-2">
                طب نت / TibNet هي منصة تساعد المستخدمين على الوصول إلى مقدمي
                الخدمات الطبية والتواصل معهم أو طلب موعد. المنصة لا تقدم
                تشخيصاً طبياً، ولا وصفات علاجية، ولا استشارات طبية مباشرة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                2. المعلومات المعروضة ليست بديلاً عن الطبيب
              </h2>
              <p className="mt-2">
                أي معلومات تظهر في الموقع، مثل بيانات الأطباء أو الاختصاصات أو
                أوقات الدوام أو العروض، هي معلومات تعريفية وتنظيمية فقط، ولا
                يجب اعتبارها نصيحة طبية أو توصية علاجية.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                3. الحالات الطارئة
              </h2>
              <p className="mt-2">
                لا تستخدم طب نت في الحالات الطارئة أو الحالات التي تحتاج إلى
                تدخل طبي عاجل. عند وجود ألم شديد، نزيف، ضيق تنفس، فقدان وعي،
                إصابة خطرة، أو أي حالة طارئة أخرى، يجب مراجعة أقرب طوارئ أو
                الاتصال بالجهات المختصة فوراً.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                4. مسؤولية القرار الطبي
              </h2>
              <p className="mt-2">
                أي قرار طبي أو علاجي يجب أن يتم بعد مراجعة طبيب أو مختص مؤهل.
                لا تتحمل طب نت مسؤولية أي قرار يتخذه المستخدم اعتماداً على
                معلومات عامة أو بيانات منشورة داخل الموقع.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                5. علاقة المستخدم بمقدم الخدمة
              </h2>
              <p className="mt-2">
                العلاقة الطبية أو الخدمية تكون مباشرة بين المستخدم ومقدم الخدمة.
                طب نت لا تتحكم بجودة الخدمة الطبية أو نتائج العلاج أو توفر
                المواعيد أو الأسعار أو تفاصيل الخدمة التي يقدمها الطرف الثالث.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                6. دقة المعلومات
              </h2>
              <p className="mt-2">
                نسعى إلى عرض معلومات دقيقة ومحدثة قدر الإمكان، لكن قد تتغير
                بعض التفاصيل مثل أوقات الدوام، العنوان، أرقام التواصل، أو توفر
                الخدمة. لذلك يُنصح بالتأكد مباشرة من مقدم الخدمة قبل الزيارة.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-navy">
                7. الخصوصية والبيانات الصحية
              </h2>
              <p className="mt-2">
                ننصح المستخدمين بعدم إرسال تفاصيل طبية حساسة أو صور أو تقارير
                طبية من خلال النماذج العامة. إذا احتجت إلى مشاركة معلومات طبية
                تفصيلية، فالأفضل أن يتم ذلك مباشرة مع الطبيب أو الجهة المختصة
                عبر قناة مناسبة وآمنة.
              </p>
            </div>

            <div className="rounded-2xl border border-primary-soft bg-surface p-5">
              <h2 className="text-lg font-black text-navy">روابط مهمة</h2>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                <Link href="/privacy" className="text-primary-dark hover:text-primary">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="text-primary-dark hover:text-primary">
                  الشروط والأحكام
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