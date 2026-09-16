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

import { PlaceCard } from "@/components/public/place-card";
import { Button } from "@/components/ui/button";

export type PublicPlaceListItem = {
  id: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  workingHours?: string | null;
  address?: string | null;
  bio?: string | null;
  services?: string | null;
  lastVerifiedAt?: string | null;
  governorate: { name: string };
  area: { name: string };
};

type PlaceKind = "pharmacy" | "lab" | "cosmetic-center";

type PlaceFilters = {
  q?: string;
  featuredOnly?: boolean;
  governorateId?: string;
  areaId?: string;
};

type PlaceResultsProps = {
  kind: PlaceKind;
  label: string;
  initialItems: PublicPlaceListItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialTotal: number;
  filters: PlaceFilters;
  gridClassName?: string;
};

type PlacePageResponse = {
  ok?: boolean;
  items?: PublicPlaceListItem[];
  total?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
  error?: string;
};

const LOAD_MORE_SIZE = 8;

export function PlaceResults({
  kind,
  label,
  initialItems,
  initialCursor,
  initialHasMore,
  initialTotal,
  filters,
  gridClassName = "card-grid"
}: PlaceResultsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [itemReturnPaths, setItemReturnPaths] = useState<Record<string, string>>({});
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const returnTo = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const filterQuery = useMemo(() => {
    const query = new URLSearchParams();
    if (filters.featuredOnly) query.set("featuredOnly", "true");
    if (filters.q) query.set("q", filters.q);
    if (filters.governorateId) query.set("governorateId", filters.governorateId);
    if (filters.areaId) query.set("areaId", filters.areaId);
    return query.toString();
  }, [filters.featuredOnly, filters.areaId, filters.governorateId, filters.q]);

  const loadMore = useCallback(async () => {
    if (requestInFlightRef.current || !hasMore || !nextCursor) return;

    const controller = new AbortController();
    abortRef.current = controller;
    requestInFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams(filterQuery);
      query.set("kind", kind);
      query.set("cursor", nextCursor);
      query.set("take", String(LOAD_MORE_SIZE));

      const response = await fetch(`/api/public/places?${query.toString()}`, {
        signal: controller.signal,
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const result = (await response.json().catch(() => null)) as PlacePageResponse | null;

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
      if (typeof result.total === "number") setTotal(result.total);
      setNextCursor(result.nextCursor ?? null);
      setHasMore(Boolean(result.hasMore && result.nextCursor));
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
  }, [pathname, filterQuery, hasMore, kind, nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (typeof IntersectionObserver === "undefined" || !sentinel || !hasMore || !nextCursor || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, nextCursor]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm font-bold text-slate-600">
          {total.toLocaleString("ar-IQ")} نتيجة مطابقة
        </p>
        <p className="text-xs text-slate-500">
          معروض الآن {items.length.toLocaleString("ar-IQ")} من {total.toLocaleString("ar-IQ")}
        </p>
      </div>

      <div className={gridClassName} aria-busy={isLoading}>
        {items.map((item) => (
          <PlaceCard
            key={item.id}
            item={item}
            label={label}
            kind={kind}
            returnTo={itemReturnPaths[item.id] ?? returnTo}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="mt-6 flex min-h-12 items-center justify-center"
        aria-live="polite"
      >
        {error ? (
          <div className="text-center" role="alert">
            <p className="mb-3 text-sm font-bold text-red-700">{error}</p>
            <Button type="button" variant="secondary" onClick={() => void loadMore()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm font-bold text-slate-500">جاري تحميل المزيد...</p>
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
    </>
  );
}
