"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="container-page grid min-h-[60vh] place-items-center py-12">
      <section className="w-full max-w-xl rounded-3xl border border-borderSoft bg-white p-7 text-center shadow-sm" role="alert">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-navy">تعذر تحميل هذه الصفحة</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          تعذر الاتصال بالخدمة مؤقتاً. أعد المحاولة بعد قليل.
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          إعادة المحاولة
        </Button>
      </section>
    </main>
  );
}
