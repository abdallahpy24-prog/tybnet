export default function Loading() {
  return (
    <main id="main-content" className="container-page py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">جاري تحميل الصفحة</span>
      <div className="animate-pulse space-y-6" aria-hidden="true">
        <div className="h-10 w-64 max-w-full rounded-xl bg-slate-200" />
        <div className="h-5 w-full max-w-2xl rounded-lg bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 rounded-2xl border border-borderSoft bg-white p-5 shadow-sm">
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-5/6 rounded bg-slate-100" />
              <div className="mt-8 h-10 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
