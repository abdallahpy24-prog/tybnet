import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-borderSoft bg-white">
      <div className="container-page flex min-h-[64px] items-center justify-center py-3">
        <Link
          href="/leaders"
          className="text-sm font-black text-navy transition hover:text-primary"
        >
          رواد الشركة
        </Link>
      </div>
    </footer>
  );
}