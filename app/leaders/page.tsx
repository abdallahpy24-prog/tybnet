import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "فريق طب نت | طب نت",
  description:
    "تعرّف على فريق طب نت والمؤسسين القائمين على تطوير المنصة وتنظيم حضورها الرقمي."
};

const leaders = [
  {
    name: "عبدالله حامد السعدي",
    title: "شريك مؤسس",
    description:
      "طالب طب وجراحة عامة، ويعمل على تطوير فكرة طب نت كمنصة تساعد على تنظيم الوصول إلى الخدمات الطبية في العراق.",
    image: "/assets/leaders/person-1.jpg"
  },
  {
    name: "عبدالله محمد الشمري",
    title: "شريك مؤسس",
    description:
      "بكالوريوس مختبرات وتحليلات طبية ومرضية، ويساهم في بناء رؤية المنصة وربطها باحتياجات القطاع الطبي والمختبري.",
    image: "/assets/leaders/person-2.jpg"
  }
];

export default function LeadersPage() {
  return (
    <SiteShell>
      <section className="container-page py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-black text-primary">
            فريق طب نت
          </p>

          <h1 className="text-4xl font-black text-navy md:text-5xl">
            القائمون على المنصة
          </h1>

          <p className="mt-4 text-base leading-8 text-slate-600">
            فريق يعمل على بناء منصة عراقية تساعد المرضى على الوصول إلى مقدمي
            الخدمات الطبية، وتدعم حضور الأطباء والصيدليات والمختبرات بشكل
            أوضح وأكثر تنظيماً.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {leaders.map((leader) => (
            <div
              key={leader.name}
              className="rounded-3xl border border-borderSoft bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-primary-soft bg-surface shadow-md">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="mt-5 text-2xl font-black text-navy">
                {leader.name}
              </h2>

              <p className="mt-2 text-sm font-bold text-primary-dark">
                {leader.title}
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {leader.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}