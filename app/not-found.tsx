import Link from "next/link";
import { Home, Search } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container-page grid min-h-[60vh] place-items-center py-12">
        <div className="w-full max-w-xl rounded-3xl border border-borderSoft bg-white p-7 text-center shadow-sm">
          <p className="text-sm font-black text-primary-dark">404</p>
          <h1 className="mt-2 text-3xl font-black text-navy">الصفحة غير موجودة</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            قد يكون الرابط تغيّر أو لم يعد متاحاً. استخدم البحث للوصول إلى مقدم الخدمة المطلوب أو ارجع إلى الرئيسية.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/doctors" className={buttonStyles()}>
              <Search className="h-4 w-4" aria-hidden="true" />
              بحث الأطباء
            </Link>
            <Link href="/" className={buttonStyles({ variant: "secondary" })}>
              <Home className="h-4 w-4" aria-hidden="true" />
              الرئيسية
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
