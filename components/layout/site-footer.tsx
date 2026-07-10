import Link from "next/link";

const mainLinks = [
  {
    href: "/",
    label: "الرئيسية"
  },
  {
    href: "/doctors",
    label: "الأطباء"
  },
  {
    href: "/dentists",
    label: "أطباء الأسنان"
  },
  {
    href: "/cosmetic-doctors",
    label: "أطباء التجميل"
  },
  {
    href: "/cosmetic-centers",
    label: "مراكز التجميل"
  },
  {
    href: "/pharmacies",
    label: "الصيدليات"
  },
  {
    href: "/labs",
    label: "المختبرات"
  },
  {
    href: "/offers",
    label: "العروض"
  }
];

const supportLinks = [
  {
    href: "/join",
    label: "انضم إلى طب نت"
  },
  {
    href: "/contact",
    label: "تواصل معنا"
  },
  {
    href: "/leaders",
    label: "فريق طب نت"
  }
];

const legalLinks = [
  {
    href: "/privacy",
    label: "سياسة الخصوصية"
  },
  {
    href: "/terms",
    label: "الشروط والأحكام"
  },
  {
    href: "/medical-disclaimer",
    label: "إخلاء المسؤولية الطبية"
  }
];

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-borderSoft bg-white">
      <div className="container-page py-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="text-2xl font-black text-navy"
            >
              طب نت
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
              منصة عراقية تنظّم الوصول إلى الأطباء
              وأطباء الأسنان وأطباء التجميل ومراكز
              التجميل والصيدليات والمختبرات، وتساعد
              الزائر على البحث حسب المحافظة والمنطقة
              والاختصاص والتواصل مع مقدم الخدمة
              بسهولة.
            </p>

            <p className="mt-4 text-xs font-bold text-slate-500">
              © {new Date().getFullYear()} طب نت /
              TybNet. جميع الحقوق محفوظة.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black text-navy">
              الأقسام
            </h2>

            <div className="mt-3 grid gap-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-navy">
              الدعم والانضمام
            </h2>

            <div className="mt-3 grid gap-2">
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-navy">
              معلومات مهمة
            </h2>

            <div className="mt-3 grid gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-primary-soft p-4 text-xs leading-6 text-slate-600">
          تنبيه: طب نت منصة للبحث والتواصل مع مقدمي
          الخدمات الطبية والتجميلية، ولا تقدم تشخيصاً
          أو علاجاً طبياً. في الحالات الطارئة، يرجى
          مراجعة أقرب مؤسسة صحية أو طوارئ فوراً.
        </div>
      </div>
    </footer>
  );
}