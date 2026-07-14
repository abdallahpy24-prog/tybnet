"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { PlaceCard } from "@/components/public/place-card";
import { Button } from "@/components/ui/button";

export type PublicPlaceListItem = {
  id: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
  workingHours?: string | null;
  address?: string | null;
  bio?: string | null;
  services?: string | null;
  inquiryCount?: number | null;
  governorate: {
    name: string;
  };
  area: {
    name: string;
  };
};

type PlaceKind =
  | "pharmacy"
  | "lab"
  | "cosmetic-center";

type PlaceFilters = {
  q?: string;
  governorateId?: string;
  areaId?: string;
};

type PlaceResultsProps = {
  kind: PlaceKind;
  label: string;
  initialItems: PublicPlaceListItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  filters: PlaceFilters;
  gridClassName?: string;
};

type PlacePageResponse = {
  ok?: boolean;
  items?: PublicPlaceListItem[];
  nextCursor?: string | null;
  hasMore?: boolean;
  error?: string;
};

const LOAD_MORE_SIZE = 4;

export function PlaceResults({
  kind,
  label,
  initialItems,
  initialCursor,
  initialHasMore,
  filters,
  gridClassName = "card-grid"
}: PlaceResultsProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] =
    useState<string | null>(initialCursor);
  const [hasMore, setHasMore] =
    useState(initialHasMore);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);

  const filterQuery = useMemo(() => {
    const query = new URLSearchParams();

    if (filters.q) {
      query.set("q", filters.q);
    }

    if (filters.governorateId) {
      query.set("governorateId", filters.governorateId);
    }

    if (filters.areaId) {
      query.set("areaId", filters.areaId);
    }

    return query.toString();
  }, [
    filters.areaId,
    filters.governorateId,
    filters.q
  ]);

  const loadMore = useCallback(async () => {
    if (
      requestInFlightRef.current ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    requestInFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams(filterQuery);

      query.set("kind", kind);
      query.set("cursor", nextCursor);
      query.set("take", String(LOAD_MORE_SIZE));

      const response = await fetch(
        `/api/public/places?${query.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        }
      );

      const result = (await response
        .json()
        .catch(() => null)) as PlacePageResponse | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "تعذر تحميل المزيد من النتائج."
        );
      }

      const newItems = Array.isArray(result.items)
        ? result.items
        : [];

      setItems((currentItems) => {
        const existingIds = new Set(
          currentItems.map((item) => item.id)
        );
        const uniqueNewItems = newItems.filter(
          (item) => !existingIds.has(item.id)
        );

        return [...currentItems, ...uniqueNewItems];
      });

      setNextCursor(result.nextCursor ?? null);
      setHasMore(
        Boolean(result.hasMore && result.nextCursor)
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "تعذر تحميل المزيد من النتائج."
      );
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [filterQuery, hasMore, kind, nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasMore ||
      !nextCursor ||
      error
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "400px 0px"
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [error, hasMore, loadMore, nextCursor]);

  return (
    <>
      <div className={gridClassName}>
        {items.map((item) => (
          <PlaceCard
            key={item.id}
            item={item}
            label={label}
            kind={kind}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="mt-6 flex min-h-12 items-center justify-center"
        aria-live="polite"
      >
        {error ? (
          <div className="text-center">
            <p className="mb-3 text-sm font-bold text-red-700">
              {error}
            </p>

            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadMore()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm font-bold text-slate-500">
            جاري تحميل المزيد...
          </p>
        ) : hasMore ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadMore()}
          >
            تحميل المزيد
          </Button>
        ) : items.length ? (
          <p className="text-sm font-bold text-slate-400">
            تم عرض جميع النتائج
          </p>
        ) : null}
      </div>
    </>
  );
}
