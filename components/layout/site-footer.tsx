import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

const directoryLinks = [
  { href: "/doctors", label: "الأطباء" },
  { href: "/dentists", label: "أطباء الأسنان" },
  { href: "/cosmetic-doctors", label: "أطباء التجميل" },
  { href: "/cosmetic-centers", label: "مراكز التجميل" },
  { href: "/pharmacies", label: "الصيدليات" },
  { href: "/labs", label: "المختبرات" }
];

const companyLinks = [
  { href: "/offers", label: "العروض" },
  { href: "/medical-marketing", label: "التسويق الطبي" },
  { href: "/join", label: "انضم إلى طب Net" },
  { href: "/leaders", label: "فريق طب Net" },
  { href: "/contact", label: "تواصل معنا" }
];

const legalLinks = [
  { href: "/privacy", label: "سياسة الخصوصية" },
  { href: "/terms", label: "الشروط والأحكام" },
  { href: "/medical-disclaimer", label: "إخلاء المسؤولية الطبية" }
];

export function SiteFooter() {
  return (
    <footer className="relative shrink-0 overflow-hidden bg-[#071a30] text-white">
      <div className="premium-dark-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" aria-hidden="true" />

      <div className="container-page relative py-11 md:py-14">
        <div className="mb-10 flex flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black text-white">كل الطب في مكان واحد</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">دليل صحي عراقي للبحث والتواصل</p>
            </div>
          </div>
          <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-white">
            ابدأ البحث
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl" aria-label="طب Net - الصفحة الرئيسية">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_14px_34px_rgba(0,0,0,0.14)]">
                <Image src="/assets/logo-mark.png" alt="" width={44} height={44} className="h-10 w-10 object-contain" />
              </span>
              <Image
                src="/assets/logo-wordmark.png"
                alt="طب Net"
                width={136}
                height={35}
                className="h-[34px] w-auto object-contain drop-shadow-[0_8px_18px_rgba(34,211,238,0.12)]"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm font-medium leading-8 text-slate-300">
              منصة عراقية تجمع الدليل الصحي في تجربة واحدة: أطباء، أسنان، صيدليات، مختبرات وخدمات تجميل طبية حسب المحافظة والمنطقة والاختصاص.
            </p>

            <Link href="/medical-marketing" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              اكتشف خدمات التسويق الطبي
            </Link>
          </div>

          <div>
            <h2 className="text-sm font-black text-white">الدليل</h2>
            <div className="mt-4 grid gap-2.5">
              {directoryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-300 transition hover:translate-x-[-2px] hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-white">طب Net</h2>
            <div className="mt-4 grid gap-2.5">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-300 transition hover:translate-x-[-2px] hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-white">الخصوصية والسياسات</h2>
            <div className="mt-4 grid gap-2.5">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-300 transition hover:translate-x-[-2px] hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-11 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold text-slate-400">
            © {new Date().getFullYear()} طب Net / TybNet. جميع الحقوق محفوظة.
          </p>
          <p className="flex max-w-2xl items-start gap-2 text-xs leading-6 text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            طب Net دليل للبحث والتواصل ولا يقدم تشخيصًا أو علاجًا. في الحالات الطارئة توجّه إلى أقرب مؤسسة صحية فورًا.
          </p>
        </div>
      </div>
    </footer>
  );
}
