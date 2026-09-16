"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ProviderCard } from "@/components/public/provider-card";
import { Button } from "@/components/ui/button";

export type PublicProviderListItem = {
  id: string;
  name: string;
  titlePrefix: string;
  slug: string;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  lastVerifiedAt?: string | null;
  specialty?: {
    name: string;
  } | null;
  governorate: {
    name: string;
  };
  area: {
    name: string;
  };
  isFeatured?: boolean;
};

type ProviderType = "DOCTOR" | "DENTIST" | "COSMETIC_DOCTOR";

type ProviderFilters = {
  q?: string;
  featuredOnly?: boolean;
  governorateId?: string;
  areaId?: string;
  specialtyId?: string;
};

type ProviderResultsProps = {
  type: ProviderType;
  initialItems: PublicProviderListItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialTotal: number;
  filters: ProviderFilters;
  detailBasePath?: string;
  showSpecialty?: boolean;
  compact?: boolean;
  gridClassName?: string;
};

type ProviderPageResponse = {
  ok?: boolean;
  items?: PublicProviderListItem[];
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
  error?: string;
};

const LOAD_MORE_SIZE = 8;

export function ProviderResults({
  type,
  initialItems,
  initialCursor,
  initialHasMore,
  initialTotal,
  filters,
  detailBasePath = "/providers",
  showSpecialty = true,
  compact = false,
  gridClassName = "grid gap-4 md:grid-cols-2"
}: ProviderResultsProps) {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [itemReturnPaths, setItemReturnPaths] = useState<Record<string, string>>({});
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const filterQuery = useMemo(() => {
    const query = new URLSearchParams();
    if (filters.featuredOnly) query.set("featuredOnly", "true");
    if (filters.q) query.set("q", filters.q);
    if (filters.governorateId) query.set("governorateId", filters.governorateId);
    if (filters.areaId) query.set("areaId", filters.areaId);
    if (filters.specialtyId) query.set("specialtyId", filters.specialtyId);
    return query.toString();
  }, [filters.featuredOnly, filters.areaId, filters.governorateId, filters.q, filters.specialtyId]);

  const returnTo = useMemo(() => {
    const query = currentSearchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [currentSearchParams, pathname]);

  const loadMore = useCallback(async () => {
    if (requestInFlightRef.current || !hasMore || !nextCursor) return;

    const controller = new AbortController();
    abortRef.current = controller;
    requestInFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams(filterQuery);
      query.set("type", type);
      query.set("cursor", nextCursor);
      query.set("take", String(LOAD_MORE_SIZE));

      const response = await fetch(`/api/public/providers?${query.toString()}`, {
        signal: controller.signal,
        method: "GET",
        headers: { Accept: "application/json" }
      });

      const result = (await response.json().catch(() => null)) as ProviderPageResponse | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "تعذر تحميل المزيد من النتائج.");
      }

      const newItems = Array.isArray(result.items) ? result.items : [];
      if (controller.signal.aborted) return;
      const pageQuery = new URLSearchParams(filterQuery);
      pageQuery.set("cursor", nextCursor);
      const pagePath = `${pathname}?${pageQuery.toString()}`;
      setItemReturnPaths((current) => ({
        ...current,
        ...Object.fromEntries(newItems.map((item) => [item.id, pagePath]))
      }));

      setItems((currentItems) => {
        const existingIds = new Set(currentItems.map((item) => item.id));
        return [
          ...currentItems,
          ...newItems.filter((item) => !existingIds.has(item.id))
        ];
      });
      setNextCursor(result.nextCursor ?? null);
      setHasMore(Boolean(result.hasMore && result.nextCursor));
      if (typeof result.total === "number") setTotal(result.total);
    } catch (loadError) {
      if (controller.signal.aborted) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "تعذر تحميل المزيد من النتائج."
      );
    } finally {
      requestInFlightRef.current = false;
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [pathname, filterQuery, hasMore, nextCursor, type]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (typeof IntersectionObserver === "undefined" || !sentinel || !hasMore || !nextCursor || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, nextCursor]);

  return (
    <section aria-label="نتائج البحث">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-borderSoft bg-white px-4 py-3">
        <p className="text-sm font-black text-navy">
          {new Intl.NumberFormat("ar-IQ").format(total)} نتيجة مطابقة
        </p>
        <p className="text-xs font-semibold text-slate-500">
          معروض الآن {new Intl.NumberFormat("ar-IQ").format(items.length)}
        </p>
      </div>

      <div className={gridClassName}>
        {items.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            compact={compact}
            detailBasePath={detailBasePath}
            showSpecialty={showSpecialty}
            returnTo={itemReturnPaths[provider.id] ?? returnTo}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="mt-6 flex min-h-12 items-center justify-center"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {error ? (
          <div className="text-center" role="alert">
            <p className="mb-3 text-sm font-bold text-red-700">{error}</p>
            <Button type="button" variant="secondary" onClick={() => void loadMore()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm font-bold text-slate-500">جاري تحميل المزيد</p>
        ) : hasMore ? (
          <Button type="button" variant="secondary" onClick={() => void loadMore()}>
            تحميل المزيد
          </Button>
        ) : items.length ? (
          <p className="text-sm font-bold text-slate-400">تم عرض جميع النتائج</p>
        ) : null}
      </div>
      {hasMore && nextCursor ? (
        <nav aria-label="صفحات النتائج" className="mt-3 text-center">
          <Link
            href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(filterQuery)), cursor: nextCursor }).toString()}`}
            prefetch={false}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-primary-dark underline"
            rel="next"
          >عرض الدفعة التالية في صفحة مستقلة</Link>
        </nav>
      ) : null}
    </section>
  );
}
