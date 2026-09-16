import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  query?: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }

  if (page > 1) params.set("page", String(page));

  const value = params.toString();
  return value ? `${basePath}?${value}` : basePath;
}

export function AdminPagination({
  basePath,
  page,
  total,
  pageSize,
  query = {}
}: AdminPaginationProps) {
  if (total <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const first = (safePage - 1) * pageSize + 1;
  const last = Math.min(safePage * pageSize, total);

  const linkClass =
    "focus-ring inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-borderSoft bg-white px-3 text-sm font-black text-navy hover:bg-primary-soft";
  const disabledClass =
    "inline-flex h-10 cursor-not-allowed items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-400";

  return (
    <nav
      className="flex flex-col gap-3 rounded-2xl border border-borderSoft bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="ترقيم صفحات الإدارة"
    >
      <p className="text-sm font-bold text-slate-600">
        عرض {first}–{last} من {total} — الصفحة {safePage} من {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {safePage > 1 ? (
          <Link
            className={linkClass}
            href={pageHref(basePath, safePage - 1, query)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            السابق
          </Link>
        ) : (
          <span className={cn(disabledClass)} aria-disabled="true">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            السابق
          </span>
        )}

        {safePage < totalPages ? (
          <Link
            className={linkClass}
            href={pageHref(basePath, safePage + 1, query)}
          >
            التالي
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={cn(disabledClass)} aria-disabled="true">
            التالي
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
